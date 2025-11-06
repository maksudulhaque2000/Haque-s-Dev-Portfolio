import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { getServerSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string; // 'image' or 'certificate'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${timestamp}-${sanitizedName}`;
    
    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Check if we're in production (Vercel) or development
    const isProduction = process.env.VERCEL === '1' || process.env.BLOB_READ_WRITE_TOKEN;

    if (isProduction && process.env.BLOB_READ_WRITE_TOKEN) {
      // Use Vercel Blob Storage in production
      try {
        const path = type === 'certificate' 
          ? `certificates/${filename}`
          : `uploads/${filename}`;

        const blob = await put(path, buffer, {
          access: 'public',
          contentType: file.type || 'application/octet-stream',
        });

        return NextResponse.json({ 
          url: blob.url, 
          filename,
          downloadUrl: blob.downloadUrl 
        });
      } catch (blobError: any) {
        console.error('Vercel Blob upload error:', blobError);
        // Fallback to local filesystem if Blob fails
        console.log('Falling back to local filesystem...');
      }
    }

    // Use local filesystem for development or as fallback
    const uploadDir = type === 'certificate' 
      ? join(process.cwd(), 'public', 'certificates')
      : join(process.cwd(), 'public', 'uploads');

    // Create directory if it doesn't exist
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const filepath = join(uploadDir, filename);
    await writeFile(filepath, buffer);

    const url = type === 'certificate' 
      ? `/certificates/${filename}`
      : `/uploads/${filename}`;

    return NextResponse.json({ url, filename });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ 
      error: 'Failed to upload file',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
