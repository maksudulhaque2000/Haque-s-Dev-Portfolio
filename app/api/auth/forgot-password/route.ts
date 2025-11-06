import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import crypto from 'crypto';
import { Resend } from 'resend';
import { rateLimit } from '@/lib/rate-limit';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Get client IP for rate limiting
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown';
    
    // Rate limiting: max 3 requests per email per hour, max 10 requests per IP per hour
    const emailLimit = rateLimit(`email:${email}`, 3, 3600000); // 3 per hour per email
    const ipLimit = rateLimit(`ip:${ip}`, 10, 3600000); // 10 per hour per IP

    if (!emailLimit.allowed) {
      return NextResponse.json(
        { 
          error: 'Too many reset requests for this email. Please wait before trying again.',
          resetTime: new Date(emailLimit.resetTime).toISOString(),
        },
        { status: 429 }
      );
    }

    if (!ipLimit.allowed) {
      return NextResponse.json(
        { 
          error: 'Too many requests from this IP. Please wait before trying again.',
          resetTime: new Date(ipLimit.resetTime).toISOString(),
        },
        { status: 429 }
      );
    }

    await connectDB();
    // Convert email to lowercase to match database schema
    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    // Always return success for security (don't reveal if email exists)
    // Also check if user has a password (not OAuth-only account)
    if (!user || !user.password) {
      // Still consume rate limit to prevent email enumeration
      return NextResponse.json({ message: 'If the email exists, a reset link has been sent.' });
    }

    // Check if there's a recent reset token (prevent spam)
    const recentResetTime = user.resetTokenExpiry 
      ? new Date(user.resetTokenExpiry).getTime() - Date.now()
      : 0;
    
    // If there's a valid token less than 5 minutes old, don't send another
    if (recentResetTime > 300000) { // 5 minutes
      console.log('Reset token already sent recently, skipping to prevent spam');
      return NextResponse.json({ 
        message: 'If the email exists, a reset link has been sent.',
        note: 'Please check your email. If you did not receive it, wait a few minutes before requesting again.',
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Store token in user document
    await User.findByIdAndUpdate(user._id, {
      resetToken,
      resetTokenExpiry,
    });

    const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}&email=${encodeURIComponent(normalizedEmail)}`;

    // Always log reset URL in development for testing
    console.log('========================================');
    console.log('🔗 PASSWORD RESET LINK (Development):');
    console.log(resetUrl);
    console.log('========================================');

    // Check if Resend API key is configured
    if (!process.env.RESEND_API_KEY) {
      console.error('⚠️ RESEND_API_KEY is not configured');
      console.log('📧 Email sending skipped. Using reset link from console above.');
      
      // Always return reset link in development mode
      return NextResponse.json({
        message: 'If the email exists, a reset link has been sent.',
        development: true,
        resetUrl: resetUrl,
        emailSent: false,
        note: 'RESEND_API_KEY not configured. Check console/terminal for reset link.',
      });
    }

    // Send email
    try {
      const emailResult = await resend.emails.send({
        from: process.env.CONTACT_EMAIL || 'onboarding@resend.dev',
        to: email,
        subject: 'Password Reset Request',
        html: `
          <h2>Password Reset Request</h2>
          <p>You requested to reset your password. Click the link below to reset it:</p>
          <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #0070f3; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this, please ignore this email.</p>
          <hr>
          <p style="color: #666; font-size: 12px;">Or copy and paste this link in your browser:</p>
          <p style="color: #666; font-size: 12px; word-break: break-all;">${resetUrl}</p>
        `,
      });

      console.log('✅ Password reset email sent successfully:', emailResult);

      return NextResponse.json({ 
        message: 'If the email exists, a reset link has been sent.',
        emailSent: true,
        // In development, also return reset URL for easy access
        ...(process.env.NODE_ENV === 'development' && {
          development: true,
          resetUrl: resetUrl,
        }),
      });
    } catch (emailError: any) {
      console.error('❌ Error sending reset email:', emailError);
      console.log('📧 Email failed, but reset link is available in console above.');
      
      // Always return reset link in development mode when email fails
      return NextResponse.json({
        message: 'If the email exists, a reset link has been sent.',
        development: true,
        resetUrl: resetUrl,
        emailSent: false,
        error: emailError.message || 'Email sending failed',
        note: 'Check console/terminal for reset link.',
      });
    }
  } catch (error: any) {
    console.error('Error in forgot password:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
