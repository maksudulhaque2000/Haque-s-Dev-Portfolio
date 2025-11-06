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

    // Get all projects without images
    const projects = await Project.find({ $or: [{ image: { $exists: false } }, { image: '' }, { image: '/server.png' }] });

    let updated = 0;

    for (const project of projects) {
      try {
        // Extract repo name from githubUrl
        const githubUrlParts = project.githubUrl.split('/');
        const repoName = githubUrlParts[githubUrlParts.length - 1];

        const readmeResponse = await fetch(`https://api.github.com/repos/${username}/${repoName}/readme`, {
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
            /!\[.*?\]\((.*?)\)/g,
            /<img[^>]+src=["']([^"']+)["'][^>]*>/gi,
            /!\[.*?\]\[(.*?)\]/g,
          ];

          let foundImage = false;
          let projectImage: string | undefined;

          for (const pattern of imagePatterns) {
            const matches = [...readmeContent.matchAll(pattern)];

            for (const match of matches) {
              if (match[1]) {
                let imageUrl = match[1].trim();

                if (imageUrl.startsWith('data:') || imageUrl.startsWith('#')) continue;

                if (!imageUrl.startsWith('http')) {
                  imageUrl = imageUrl.replace(/^\.\//, '').replace(/^\//, '').trim();

                  if (!imageUrl.includes('.')) {
                    const refRegex = new RegExp(`\\[${imageUrl}\\]:\\s*(.+)`, 'i');
                    const refMatch = readmeContent.match(refRegex);
                    if (refMatch && refMatch[1]) {
                      imageUrl = refMatch[1].trim();
                    } else {
                      continue;
                    }
                  }

                  // Get default branch
                  const repoResponse = await fetch(`https://api.github.com/repos/${username}/${repoName}`, {
                    headers: {
                      Authorization: `token ${token}`,
                      Accept: 'application/vnd.github.v3+json',
                    },
                  });

                  let branch = 'main';
                  if (repoResponse.ok) {
                    const repoData = await repoResponse.json();
                    branch = repoData.default_branch || repoData.master_branch || 'main';
                  }

                  projectImage = `https://raw.githubusercontent.com/${username}/${repoName}/${branch}/${imageUrl}`;
                } else if (imageUrl.startsWith('http')) {
                  projectImage = imageUrl;
                }

                if (projectImage) {
                  const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'];
                  const hasImageExt = imageExtensions.some(ext =>
                    projectImage!.toLowerCase().includes(ext)
                  );

                  if (hasImageExt || projectImage.includes('raw.githubusercontent.com')) {
                    foundImage = true;
                    break;
                  }
                }
              }
            }

            if (foundImage) break;
          }

          // Update project with image or fallback
          await Project.findByIdAndUpdate(project._id, {
            image: projectImage || '/server.png',
          });

          if (foundImage) {
            updated++;
          }
        }
      } catch (error) {
        console.error(`Error updating image for ${project.name}:`, error);
        // Set fallback image if error occurs
        await Project.findByIdAndUpdate(project._id, {
          image: '/server.png',
        });
      }
    }

    return NextResponse.json({
      updated,
      total: projects.length,
      message: `Updated images for ${updated} projects`,
    });
  } catch (error) {
    console.error('Error updating project images:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

