'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Save, Upload, Edit2 } from 'lucide-react';
import Image from 'next/image';
import { ImageCropper } from '@/components/ui/image-cropper';

export default function HomeManagementPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    profileImage: '',
    name: '',
    title: '',
    description: '',
    resumeLink: '',
  });
  const [cropperOpen, setCropperOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState('');

  useEffect(() => {
    fetch('/api/dashboard/home')
      .then((res) => res.json())
      .then((data) => {
        if (data.home) {
          setFormData(data.home);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setImageToCrop(reader.result as string);
      setCropperOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const handleCroppedImage = async (croppedImageDataUrl: string) => {
    try {
      // Convert data URL to blob
      const response = await fetch(croppedImageDataUrl);
      const blob = await response.blob();

      // Create FormData and upload
      const formData = new FormData();
      formData.append('file', blob, 'cropped-image.jpg');
      formData.append('type', 'image');

      const res = await fetch('/api/dashboard/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setFormData((prev) => ({ ...prev, profileImage: data.url }));
        toast.success('Image uploaded and cropped successfully!');
      } else {
        toast.error('Failed to upload image');
      }
    } catch (error) {
      toast.error('Error uploading image');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch('/api/dashboard/home', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success('Home section updated successfully!');
      } else {
        toast.error('Failed to update');
      }
    } catch (error) {
      toast.error('Error updating');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Manage Home Section</h1>
      <Card>
        <CardHeader>
          <CardTitle>Home Content</CardTitle>
          <CardDescription>Update your profile information displayed on the home page</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label>Profile Image</Label>
              <div className="mt-2 space-y-4">
                {formData.profileImage && (
                  <div className="relative w-48 h-48 rounded-full overflow-hidden border-2 border-border">
                    <Image
                      src={formData.profileImage}
                      alt="Profile"
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 192px, 192px"
                    />
                  </div>
                )}
                <div className="flex items-center gap-4">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="w-auto"
                    id="profile-image-upload"
                  />
                  {formData.profileImage && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setImageToCrop(formData.profileImage);
                        setCropperOpen(true);
                      }}
                    >
                      <Edit2 className="mr-2 h-4 w-4" />
                      Edit Image
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Maksudul Haque / মাকসুদুল হক"
                required
              />
            </div>

            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Student | Web Developer | Competitive Programmer | Problem Solver"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={5}
                required
              />
            </div>

            <div>
              <Label htmlFor="resumeLink">Resume Link</Label>
              <Input
                id="resumeLink"
                value={formData.resumeLink}
                onChange={(e) => setFormData({ ...formData, resumeLink: e.target.value })}
                placeholder="#resume"
              />
            </div>

            <Button type="submit" disabled={saving}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {imageToCrop && (
        <ImageCropper
          image={imageToCrop}
          open={cropperOpen}
          onClose={() => {
            setCropperOpen(false);
            setImageToCrop('');
          }}
          onCropComplete={handleCroppedImage}
          aspectRatio={1}
        />
      )}
    </div>
  );
}
