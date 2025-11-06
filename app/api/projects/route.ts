import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Project from '@/lib/models/Project';

export async function GET() {
  try {
    await connectDB();
    const projects = await Project.find({ isApproved: true }).sort({ createdAt: -1 });
    return NextResponse.json({ projects: JSON.parse(JSON.stringify(projects)) });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json({ projects: [] }, { status: 500 });
  }
}
