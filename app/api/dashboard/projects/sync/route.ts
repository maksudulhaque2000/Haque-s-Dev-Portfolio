import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Project from '@/lib/models/Project';

export async function POST() {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = process.env.GITHUB_TOKEN;
    const username = process.env.GITHUB_USERNAME;

    if (!token || !username) {
      return NextResponse.json({ error: 'GitHub token or username not configured' }, { status: 400 });
    }

    await connectDB();

    // Fetch repos from GitHub
    const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=100`, {
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch from GitHub' }, { status: 500 });
    }

    const repos = await response.json();
    let added = 0;

    for (const repo of repos) {
      if (repo.fork) continue; // Skip forks

      // Check if project already exists
      const existing = await Project.findOne({ githubId: repo.id });
      if (existing) continue;

      // Determine category based on topics and languages
      let category = 'other';
      const topics = (repo.topics || []).map((t: string) => t.toLowerCase());
      
      // Fetch language statistics from GitHub API
      let languageStats: { [key: string]: number } = {};
      let languages: string[] = [];
      let languagePercentages: { [key: string]: number } = {};
      
      try {
        if (repo.languages_url) {
          const langResponse = await fetch(repo.languages_url, {
            headers: { Authorization: `token ${token}` }
          });
          if (langResponse.ok) {
            languageStats = await langResponse.json();
            languages = Object.keys(languageStats);
            
            // Calculate percentages
            const totalBytes = Object.values(languageStats).reduce((sum: number, bytes: any) => sum + bytes, 0);
            if (totalBytes > 0) {
              Object.keys(languageStats).forEach((lang) => {
                languagePercentages[lang] = Math.round((languageStats[lang] / totalBytes) * 100);
              });
            }
          }
        }
      } catch (error) {
        console.error(`Error fetching languages for ${repo.name}:`, error);
      }

      const allTech = [...topics, ...languages].map((t: string) => t.toLowerCase());
      
      if (allTech.some((t: string) => ['frontend', 'react', 'vue', 'angular', 'nextjs'].includes(t))) {
        category = 'frontend';
      } else if (allTech.some((t: string) => ['backend', 'node', 'express', 'api', 'server'].includes(t))) {
        category = 'backend';
      } else if (allTech.some((t: string) => ['fullstack', 'full-stack', 'mern', 'mean'].includes(t))) {
        category = 'fullstack';
      }

      // Fetch README to extract images
      let projectImage: string | undefined;
      try {
        // Get default branch from repo
        const branch = repo.default_branch || repo.master_branch || 'main';
        
        const readmeResponse = await fetch(`https://api.github.com/repos/${username}/${repo.name}/readme`, {
          headers: {
            Authorization: `token ${token}`,
            Accept: 'application/vnd.github.v3+json',
          },
        });
        
        if (readmeResponse.ok) {
          const readmeData = await readmeResponse.json();
          const readmeContent = Buffer.from(readmeData.content, 'base64').toString('utf-8');
          
          // Extract images from README - multiple patterns
          const imagePatterns = [
            /!\[.*?\]\((.*?)\)/g,  // Standard markdown: ![alt](url)
            /<img[^>]+src=["']([^"']+)["'][^>]*>/gi,  // HTML img tag
            /!\[.*?\]\[(.*?)\]/g,  // Reference style: ![alt][ref]
          ];
          
          // First, extract all reference definitions
          const refDefinitions: { [key: string]: string } = {};
          const refPattern = /^\[([^\]]+)\]:\s*(.+)$/gm;
          let refMatch;
          while ((refMatch = refPattern.exec(readmeContent)) !== null) {
            refDefinitions[refMatch[1].toLowerCase()] = refMatch[2].trim();
          }
          
          let foundImage = false;
          
          for (const pattern of imagePatterns) {
            const matches = [...readmeContent.matchAll(pattern)];
            
            for (const match of matches) {
              if (match[1]) {
                let imageUrl = match[1].trim();
                
                // Skip data URIs and anchors
                if (imageUrl.startsWith('data:') || imageUrl.startsWith('#')) continue;
                
                // Handle reference-style images
                if (!imageUrl.includes('.') && !imageUrl.startsWith('http')) {
                  const refKey = imageUrl.toLowerCase();
                  if (refDefinitions[refKey]) {
                    imageUrl = refDefinitions[refKey];
                  } else {
                    continue;
                  }
                }
                
                // Convert relative URLs to absolute GitHub raw URLs
                if (!imageUrl.startsWith('http')) {
                  // Remove leading ./, /, or spaces
                  imageUrl = imageUrl.replace(/^\.\//, '').replace(/^\//, '').trim();
                  
                  // Build GitHub raw URL
                  projectImage = `https://raw.githubusercontent.com/${username}/${repo.name}/${branch}/${imageUrl}`;
                } else if (imageUrl.startsWith('http')) {
                  projectImage = imageUrl;
                }
                
                // Validate image URL
                if (projectImage) {
                  // Check if it's a valid image extension
                  const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'];
                  const hasImageExt = imageExtensions.some(ext => 
                    projectImage!.toLowerCase().includes(ext.toLowerCase())
                  );
                  
                  if (hasImageExt || projectImage.includes('raw.githubusercontent.com')) {
                    // Try to verify the image exists by checking the URL format
                    foundImage = true;
                    break;
                  }
                }
              }
            }
            
            if (foundImage) break;
          }
        }
      } catch (error) {
        console.error(`Error fetching README for ${repo.name}:`, error);
      }
      
      // Use fallback image for backend projects or if no image found
      if (!projectImage) {
        projectImage = '/server.png';
      }

      await Project.create({
        githubId: repo.id,
        name: repo.name,
        description: repo.description || 'No description',
        url: repo.homepage, // Only use homepage, not html_url
        homepage: repo.homepage,
        language: repo.language,
        languages: languages,
        topics: topics,
        technologies: allTech.slice(0, 10),
        category: category as any,
        isApproved: false,
        githubUrl: repo.html_url,
        image: projectImage,
        languagePercentages: languagePercentages,
      });

      added++;
    }

    return NextResponse.json({ added, message: `Synced ${added} new projects` });
  } catch (error) {
    console.error('GitHub sync error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

