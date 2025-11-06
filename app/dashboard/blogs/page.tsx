'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Plus, Trash2, Edit, Save, X, Upload, Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import Link from 'next/link';
import { createSlug } from '@/lib/slugify';

interface Blog {
  _id?: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  image?: string;
  published: boolean;
  views: number;
}

export default function BlogsManagementPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Blog>({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    published: false,
    views: 0,
  });
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const res = await fetch('/api/dashboard/blogs');
      const data = await res.json();
      setBlogs(data.blogs || []);
    } catch (error) {
      toast.error('Failed to fetch blogs');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'image');

    try {
      const res = await fetch('/api/dashboard/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setFormData((prev) => ({ ...prev, image: data.url }));
        toast.success('Image uploaded successfully!');
      } else {
        toast.error('Failed to upload image');
      }
    } catch (error) {
      toast.error('Error uploading image');
    }
  };

  const handleTitleChange = (title: string) => {
    setFormData({
      ...formData,
      title,
      slug: createSlug(title),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingId ? `/api/dashboard/blogs/${editingId}` : '/api/dashboard/blogs';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success(editingId ? 'Blog updated!' : 'Blog created!');
        resetForm();
        fetchBlogs();
      } else {
        toast.error('Failed to save blog');
      }
    } catch (error) {
      toast.error('Error saving blog');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      content: '',
      excerpt: '',
      published: false,
      views: 0,
    });
    setEditingId(null);
  };

  const handleEdit = (blog: Blog) => {
    setFormData(blog);
    setEditingId(blog._id || null);
  };

  const handleDeleteClick = (id: string) => {
    setItemToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;

    try {
      const res = await fetch(`/api/dashboard/blogs/${itemToDelete}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast.success('Blog deleted!');
        fetchBlogs();
      } else {
        toast.error('Failed to delete blog');
      }
    } catch (error) {
      toast.error('Error deleting blog');
    } finally {
      setItemToDelete(null);
      setDeleteModalOpen(false);
    }
  };

  const togglePublish = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/dashboard/blogs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: !currentStatus }),
      });

      if (res.ok) {
        toast.success(`Blog ${!currentStatus ? 'published' : 'unpublished'}!`);
        fetchBlogs();
      } else {
        toast.error('Failed to update blog');
      }
    } catch (error) {
      toast.error('Error updating blog');
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Manage Blogs</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{editingId ? 'Edit Blog' : 'Create New Blog'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="excerpt">Excerpt</Label>
              <Textarea
                id="excerpt"
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                rows={2}
                required
              />
            </div>

            <div>
              <Label htmlFor="content">Content</Label>
              <RichTextEditor
                value={formData.content}
                onChange={(value) => setFormData({ ...formData, content: value })}
                placeholder="Write your blog content here..."
              />
            </div>

            <div>
              <Label>Featured Image</Label>
              {formData.image && (
                <div className="relative w-64 h-32 rounded-lg overflow-hidden border-2 border-border mt-2 mb-2">
                  <Image src={formData.image} alt="Blog" fill className="object-cover" />
                </div>
              )}
              <Input type="file" accept="image/*" onChange={handleFileUpload} className="w-auto mt-2" />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="published"
                checked={formData.published}
                onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                className="h-4 w-4"
              />
              <Label htmlFor="published">Published</Label>
            </div>

            <div className="flex gap-2">
              <Button type="submit">
                {editingId ? (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Update
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Blog
                  </>
                )}
              </Button>
              {editingId && (
                <Button type="button" variant="outline" onClick={resetForm}>
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Blogs ({blogs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {blogs.map((blog) => (
              <div key={blog._id} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">{blog.title}</h3>
                      {blog.published ? (
                        <span className="px-2 py-1 bg-green-500/10 text-green-500 text-xs rounded">
                          Published
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-gray-500/10 text-gray-500 text-xs rounded">
                          Draft
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{blog.excerpt}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span>{blog.views} views</span>
                      {blog.published && (
                        <Link href={`/blogs/${blog.slug}`} target="_blank" className="text-primary hover:underline">
                          View Post
                        </Link>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => togglePublish(blog._id!, blog.published)}
                    >
                      {blog.published ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(blog)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteClick(blog._id!)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {blogs.length === 0 && (
              <p className="text-center text-muted-foreground py-8">No blogs created yet</p>
            )}
          </div>
        </CardContent>
      </Card>

      <ConfirmationModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        onConfirm={handleDelete}
        title="Delete Blog"
        description="Are you sure you want to delete this blog? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />
    </div>
  );
}

