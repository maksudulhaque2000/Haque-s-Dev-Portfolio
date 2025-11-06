import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Education from '@/lib/models/Education';

export async function GET() {
  try {
    await connectDB();
    const educations = await Education.find().sort({ createdAt: -1 });
    return NextResponse.json({ educations: JSON.parse(JSON.stringify(educations)) });
  } catch (error) {
    console.error('Error fetching educations:', error);
    return NextResponse.json({ educations: [] }, { status: 500 });
  }
}
