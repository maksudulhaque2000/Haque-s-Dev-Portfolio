import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
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

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    await connectDB();

    // Get max order to set new order
    const maxOrderLink = await SocialLink.findOne().sort({ order: -1 });
    const newOrder = maxOrderLink ? maxOrderLink.order + 1 : 0;

    const socialLink = await SocialLink.create({
      ...data,
      order: data.order !== undefined ? data.order : newOrder,
    });

    return NextResponse.json({ socialLink, message: 'Social link created successfully' });
  } catch (error: any) {
    console.error('Error creating social link:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

