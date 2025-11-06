import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathArray } = await params;
    const filename = pathArray.join('/');
    
    // Security: Prevent directory traversal
    if (filename.includes('..')) {
      return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
    }

    const filePath = join(process.cwd(), 'public', 'certificates', filename);
    
    if (!existsSync(filePath)) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const file = await readFile(filePath);
    const ext = filename.split('.').pop()?.toLowerCase();
    
    let contentType = 'application/octet-stream';
    if (ext === 'pdf') {
      contentType = 'application/pdf';
    } else if (ext === 'jpg' || ext === 'jpeg') {
      contentType = 'image/jpeg';
    } else if (ext === 'png') {
      contentType = 'image/png';
    }

    return new NextResponse(file, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Error serving certificate:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

