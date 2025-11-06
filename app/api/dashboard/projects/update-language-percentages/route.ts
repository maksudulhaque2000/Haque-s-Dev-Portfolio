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

    // Get all projects
    const projects = await Project.find({});

    let updated = 0;

    for (const project of projects) {
      try {
        // Extract repo name from githubUrl
        const githubUrlParts = project.githubUrl.split('/');
        const repoName = githubUrlParts[githubUrlParts.length - 1];

        // Fetch language statistics from GitHub API
        let languageStats: { [key: string]: number } = {};
        let languagePercentages: { [key: string]: number } = {};

        try {
          const langResponse = await fetch(
            `https://api.github.com/repos/${username}/${repoName}/languages`,
            {
              headers: {
                Authorization: `token ${token}`,
                Accept: 'application/vnd.github.v3+json',
              },
            }
          );

          if (langResponse.ok) {
            languageStats = await langResponse.json();

            // Calculate percentages
            const totalBytes = Object.values(languageStats).reduce(
              (sum: number, bytes: any) => sum + bytes,
              0
            );

            if (totalBytes > 0) {
              Object.keys(languageStats).forEach((lang) => {
                languagePercentages[lang] = Math.round((languageStats[lang] / totalBytes) * 100);
              });
            }

            // Update project with language percentages
            await Project.findByIdAndUpdate(project._id, {
              languagePercentages: languagePercentages,
            });

            if (Object.keys(languagePercentages).length > 0) {
              updated++;
            }
          }
        } catch (error) {
          console.error(`Error fetching languages for ${project.name}:`, error);
        }
      } catch (error) {
        console.error(`Error updating language percentages for ${project.name}:`, error);
      }
    }

    return NextResponse.json({
      updated,
      total: projects.length,
      message: `Updated language percentages for ${updated} projects`,
    });
  } catch (error) {
    console.error('Error updating language percentages:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

