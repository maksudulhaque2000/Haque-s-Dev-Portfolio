import { NextResponse } from 'next/server';
import { generateResumePDF } from '@/lib/resume-generator';

export async function GET() {
  try {
    const latexContent = await generateResumePDF();
    
    // Create a proper filename with timestamp
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `Maksudul_Haque_Resume_${timestamp}.tex`;
    
    return new NextResponse(latexContent, {
      headers: {
        'Content-Type': 'application/x-latex; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
      },
    });
  } catch (error) {
    console.error('Error generating resume:', error);
    return NextResponse.json({ error: 'Failed to generate resume' }, { status: 500 });
  }
}

