import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const email = 'smmaksudulhaque2000@gmail.com';
    const password = '474975moon@';
    const name = 'Maksudul Haque';

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create or update the user
    const user = await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      {
        email: email.toLowerCase(),
        password: hashedPassword,
        name: name,
        provider: 'credentials',
      },
      { upsert: true, new: true }
    );

    return NextResponse.json(
      {
        success: true,
        message: 'User created/updated successfully',
        user: {
          email: user.email,
          name: user.name,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error setting up user:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Error setting up user',
        error: error.message,
      },
      { status: 500 }
    );
  }
}

