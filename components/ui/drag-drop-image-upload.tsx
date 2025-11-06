'use client';

import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { Upload, Image as ImageIcon, Edit2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface DragDropImageUploadProps {
  onFileSelect: (file: File) => void;
  currentImage?: string;
  onEditClick?: () => void;
  label?: string;
  accept?: string;
  className?: string;
  previewClassName?: string;
  showEditButton?: boolean;
}

export function DragDropImageUpload({
  onFileSelect,
  currentImage,
  onEditClick,
  label = 'Image',
  accept = 'image/*',
  className,
  previewClassName,
  showEditButton = true,
}: DragDropImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragCounter, setDragCounter] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return false;
    }
    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error('Image size must be less than 10MB');
      return false;
    }
    return true;
  };

  const handleFile = (file: File) => {
    if (!validateFile(file)) {
      return;
    }
    onFileSelect(file);
  };

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter((prev) => prev + 1);
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter((prev) => {
      const newCounter = prev - 1;
      if (newCounter === 0) {
        setIsDragging(false);
      }
      return newCounter;
    });
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setDragCounter(0);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      handleFile(file);
      e.dataTransfer.clearData();
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={cn('space-y-4', className)}>
      {label && (
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
        </label>
      )}
      
      <div
        className={cn(
          'relative border-2 border-dashed rounded-lg transition-all duration-200',
          isDragging
            ? 'border-primary bg-primary/10 scale-[1.02]'
            : 'border-border hover:border-primary/50',
          currentImage ? 'p-0' : 'p-8'
        )}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileInputChange}
          className="hidden"
        />

        {currentImage ? (
          <div className={cn('relative group', previewClassName)}>
            <img
              src={currentImage}
              alt="Preview"
              className={cn(
                'w-full h-full object-cover rounded-lg',
                previewClassName
              )}
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center gap-4">
              <div className="text-white text-center">
                <Upload className="h-8 w-8 mx-auto mb-2" />
                <p className="text-sm font-medium">Click or drag to replace</p>
              </div>
            </div>
            {isDragging && (
              <div className="absolute inset-0 bg-primary/20 border-4 border-primary border-dashed rounded-lg flex items-center justify-center">
                <div className="text-primary text-center">
                  <Upload className="h-12 w-12 mx-auto mb-2 animate-bounce" />
                  <p className="text-lg font-semibold">Drop image here</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center">
            {isDragging ? (
              <div className="space-y-4">
                <Upload className="h-16 w-16 mx-auto text-primary animate-bounce" />
                <div>
                  <p className="text-lg font-semibold text-primary">
                    Drop your image here
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Release to upload
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">
                    <span className="text-primary hover:underline cursor-pointer">
                      Click to upload
                    </span>{' '}
                    or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PNG, JPG, GIF up to 10MB
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {currentImage && showEditButton && onEditClick && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onEditClick();
          }}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
        >
          <Edit2 className="mr-2 h-4 w-4" />
          Edit Image
        </button>
      )}
    </div>
  );
}

