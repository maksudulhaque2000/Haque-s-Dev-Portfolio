import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import SocialLink from '@/lib/models/SocialLink';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const data = await request.json();
    await connectDB();

    const socialLink = await SocialLink.findByIdAndUpdate(id, data, { new: true });

    if (!socialLink) {
      return NextResponse.json({ error: 'Social link not found' }, { status: 404 });
    }

    return NextResponse.json({ socialLink, message: 'Social link updated successfully' });
  } catch (error: any) {
    console.error('Error updating social link:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();

    const socialLink = await SocialLink.findByIdAndDelete(id);

    if (!socialLink) {
      return NextResponse.json({ error: 'Social link not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Social link deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting social link:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

