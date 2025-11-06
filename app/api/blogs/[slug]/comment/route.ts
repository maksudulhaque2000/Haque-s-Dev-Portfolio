import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Blog from '@/lib/models/Blog';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { name, email, comment } = await request.json();
    
    if (!name || !email || !comment) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    await connectDB();
    const blog = await Blog.findOne({ slug });

    if (!blog) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }

    // Add comment
    const newComment = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name,
      email,
      comment,
      createdAt: new Date(),
    };

    blog.comments.push(newComment);
    await blog.save();

    return NextResponse.json({ comments: blog.comments });
  } catch (error) {
    console.error('Error adding comment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
