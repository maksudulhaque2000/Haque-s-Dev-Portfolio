import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Blog from '@/lib/models/Blog';

export async function GET() {
  try {
    await connectDB();
    const blogs = await Blog.find({ published: true }).sort({ createdAt: -1 });
    return NextResponse.json({ blogs: JSON.parse(JSON.stringify(blogs)) });
  } catch (error) {
    console.error('Error fetching blogs:', error);
    return NextResponse.json({ blogs: [] }, { status: 500 });
  }
}
