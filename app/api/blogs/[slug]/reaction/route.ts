import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Blog from '@/lib/models/Blog';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { type, userIp } = await request.json();
    
    if (!type || !['like', 'love', 'celebrate'].includes(type)) {
      return NextResponse.json({ error: 'Invalid reaction type' }, { status: 400 });
    }

    await connectDB();
    const blog = await Blog.findOne({ slug });

    if (!blog) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }

    // Initialize reactions if not exists
    if (!blog.reactions) {
      blog.reactions = {
        like: { count: 0, users: [] },
        love: { count: 0, users: [] },
        celebrate: { count: 0, users: [] },
      };
    }

    const reactionKey = type as 'like' | 'love' | 'celebrate';
    const reaction = blog.reactions[reactionKey] || { count: 0, users: [] };

    // Check if user already reacted
    if (reaction.users.includes(userIp)) {
      return NextResponse.json({ error: 'Already reacted' }, { status: 400 });
    }

    // Add reaction
    reaction.users.push(userIp);
    reaction.count = reaction.users.length;
    blog.reactions[reactionKey] = reaction;

    await blog.save();

    return NextResponse.json({ reactions: blog.reactions });
  } catch (error) {
    console.error('Error adding reaction:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
