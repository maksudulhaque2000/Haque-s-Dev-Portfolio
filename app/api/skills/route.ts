import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Skill from '@/lib/models/Skill';

export async function GET() {
  try {
    await connectDB();
    const skills = await Skill.find().sort({ name: 1 });
    return NextResponse.json({ skills: JSON.parse(JSON.stringify(skills)) });
  } catch (error) {
    console.error('Error fetching skills:', error);
    return NextResponse.json({ skills: [] }, { status: 500 });
  }
}
