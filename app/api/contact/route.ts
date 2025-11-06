import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { name, email, subject, message } = await request.json();

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const emailContent = `
      New contact form submission from portfolio:
      
      Name: ${name}
      Email: ${email}
      Subject: ${subject}
      
      Message:
      ${message}
    `;

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // Send auto-reply to the person who contacted FIRST
    const autoReplyText = `
Dear ${name},

Thank you for reaching out to me through my portfolio website!

I have received your message regarding "${subject}" and I truly appreciate you taking the time to contact me.

I will review your message and get back to you as soon as possible, typically within 24-48 hours.

Best regards,
Maksudul Haque
Full Stack Developer

---
This is an automated response. Please do not reply to this email.
If you need to reach me directly, please use the contact form on my portfolio.
    `;

    const autoReplyHtml = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Thank you for contacting me</title>
  </head>
  <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
      <h1 style="color: white; margin: 0;">Thank You for Contacting Me!</h1>
    </div>
    <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0;">
      <p style="font-size: 16px;">Dear <strong>${name}</strong>,</p>
      
      <p>Thank you for reaching out to me through my portfolio website!</p>
      
      <p>I have received your message regarding <strong>"${subject}"</strong> and I truly appreciate you taking the time to contact me.</p>
      
      <p>I will review your message and get back to you as soon as possible, typically within <strong>24-48 hours</strong>.</p>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
        <p style="margin: 0;">Best regards,<br>
        <strong>Maksudul Haque</strong><br>
        Full Stack Developer</p>
      </div>
      
      <div style="margin-top: 30px; padding: 15px; background: #fff; border-left: 4px solid #667eea; font-size: 12px; color: #666;">
        <p style="margin: 0;"><em>This is an automated response. Please do not reply to this email.<br>
        If you need to reach me directly, please use the contact form on my portfolio.</em></p>
      </div>
    </div>
  </body>
</html>
    `;

    let autoReplySent = false;
    let autoReplyError = null;

    // Send auto-reply to the person who contacted
    try {
      console.log('📧 Sending auto-reply to:', email);
      const autoReplyResult = await resend.emails.send({
        from: 'Maksudul Haque <onboarding@resend.dev>',
        to: email,
        subject: `Re: ${subject} - Thank you for contacting me!`,
        text: autoReplyText,
        html: autoReplyHtml,
      });
      
      // Check if there's an error in the response
      if (autoReplyResult.error) {
        console.error('❌ Auto-reply error:', autoReplyResult.error);
        const error = autoReplyResult.error as any;
        autoReplyError = error.message || 'Unknown error';
        
        // If domain not verified, provide helpful message
        if (error.statusCode === 403 || error.message?.includes('domain')) {
          autoReplyError = 'Domain verification required. Please verify your domain in Resend dashboard to send emails to external recipients.';
        }
      } else {
        console.log('✅ Auto-reply sent successfully:', autoReplyResult);
        autoReplySent = true;
      }
    } catch (error: any) {
      console.error('❌ Error sending auto-reply:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      autoReplyError = error.message || 'Unknown error';
    }

    // Send email to portfolio owner
    try {
      console.log('📧 Sending notification to portfolio owner');
      const ownerEmailResult = await resend.emails.send({
        from: 'Portfolio Contact <onboarding@resend.dev>',
        to: process.env.CONTACT_EMAIL || 'smmaksudulhaque2000@gmail.com',
        subject: `Portfolio Contact: ${subject}`,
        text: emailContent,
        reply_to: email,
      });
      console.log('✅ Owner notification sent successfully:', ownerEmailResult);
    } catch (error: any) {
      console.error('❌ Error sending owner notification:', error);
      // If owner email fails, still try to return success if auto-reply worked
      if (!autoReplySent) {
        throw error;
      }
    }

    // Return response with status of both emails
    if (autoReplySent) {
      return NextResponse.json({ 
        message: 'Email sent successfully',
        autoReplySent: true 
      });
    } else {
      return NextResponse.json({ 
        message: 'Your message was received, but auto-reply failed. We will contact you soon.',
        autoReplySent: false,
        error: autoReplyError 
      }, { status: 207 }); // 207 Multi-Status
    }
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
