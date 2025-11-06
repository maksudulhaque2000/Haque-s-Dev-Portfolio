'use client';

import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface DownloadResumeButtonProps {
  className?: string;
  size?: 'default' | 'sm' | 'lg' | 'icon';
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
}

export function DownloadResumeButton({ 
  className = '', 
  size = 'lg',
  variant = 'default'
}: DownloadResumeButtonProps) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    try {
      setDownloading(true);
      const response = await fetch('/api/resume/download');
      
      if (!response.ok) {
        throw new Error('Failed to generate resume');
      }

      // Get the filename from Content-Disposition header or use default
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = 'resume.tex';
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, '');
          // Decode URI encoded filename
          filename = decodeURIComponent(filename);
        }
      }

      // Get the blob content
      const blob = await response.blob();
      
      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Resume downloaded successfully!');
    } catch (error) {
      console.error('Error downloading resume:', error);
      toast.error('Failed to download resume. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Button 
      size={size} 
      variant={variant}
      className={`group ${className}`}
      onClick={handleDownload}
      disabled={downloading}
    >
      <Download className={`mr-2 h-4 w-4 ${downloading ? '' : 'group-hover:animate-bounce'}`} />
      {downloading ? 'Downloading...' : 'Download Resume'}
    </Button>
  );
}

