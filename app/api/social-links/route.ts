import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import SocialLink from '@/lib/models/SocialLink';

export async function GET() {
  try {
    await connectDB();
    const socialLinks = await SocialLink.find().sort({ order: 1 });
    return NextResponse.json({ socialLinks });
  } catch (error) {
    console.error('Error fetching social links:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

