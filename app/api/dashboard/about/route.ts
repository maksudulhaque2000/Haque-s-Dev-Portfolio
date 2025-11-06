import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import About from '@/lib/models/About';

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const about = await About.findOne();
    return NextResponse.json({ about: about || null });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    await connectDB();

    // Validate required fields
    if (!data.image || !data.description || !data.location) {
      return NextResponse.json(
        { error: 'Missing required fields: image, description, or location' },
        { status: 400 }
      );
    }

    // Ensure languages and interests are arrays
    const updateData = {
      image: data.image,
      description: data.description,
      location: data.location,
      languages: Array.isArray(data.languages) ? data.languages : [],
      interests: Array.isArray(data.interests) ? data.interests : [],
    };

    let about = await About.findOne();
    if (about) {
      // Update each field explicitly
      about.image = updateData.image;
      about.description = updateData.description;
      about.location = updateData.location;
      about.languages = updateData.languages;
      about.interests = updateData.interests;
      await about.save();
    } else {
      about = await About.create(updateData);
    }

    return NextResponse.json({ about, message: 'About section updated successfully' });
  } catch (error: any) {
    console.error('Error updating about section:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

