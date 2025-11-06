import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Experience from '@/lib/models/Experience';

export async function GET() {
  try {
    await connectDB();
    const experiences = await Experience.find().sort({ createdAt: -1 });
    return NextResponse.json({ experiences: JSON.parse(JSON.stringify(experiences)) });
  } catch (error) {
    console.error('Error fetching experiences:', error);
    return NextResponse.json({ experiences: [] }, { status: 500 });
  }
}
