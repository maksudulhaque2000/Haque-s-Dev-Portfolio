'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Plus, Trash2, Edit, Save, X, ExternalLink } from 'lucide-react';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';

// Available icons from lucide-react
const availableIcons = [
  { value: 'Mail', label: 'Email' },
  { value: 'Github', label: 'GitHub' },
  { value: 'Linkedin', label: 'LinkedIn' },
  { value: 'Facebook', label: 'Facebook' },
  { value: 'Instagram', label: 'Instagram' },
  { value: 'Youtube', label: 'YouTube' },
  { value: 'Twitter', label: 'Twitter' },
  { value: 'Globe', label: 'Website' },
  { value: 'MessageCircle', label: 'Message' },
  { value: 'Phone', label: 'Phone' },
];

interface SocialLink {
  _id?: string;
  name: string;
  url: string;
  icon: string;
  order: number;
}

export default function SocialLinksManagementPage() {
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<SocialLink>({
    name: '',
    url: '',
    icon: 'Globe',
    order: 0,
  });
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchSocialLinks();
  }, []);

  const fetchSocialLinks = async () => {
    try {
      const res = await fetch('/api/dashboard/social-links');
      const data = await res.json();
      setSocialLinks(data.socialLinks || []);
    } catch (error) {
      toast.error('Failed to fetch social links');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingId
        ? `/api/dashboard/social-links/${editingId}`
        : '/api/dashboard/social-links';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success(editingId ? 'Social link updated!' : 'Social link added!');
        resetForm();
        fetchSocialLinks();
      } else {
        toast.error('Failed to save social link');
      }
    } catch (error) {
      toast.error('Error saving social link');
    }
  };

  const handleEdit = (link: SocialLink) => {
    setFormData(link);
    setEditingId(link._id || null);
  };

  const handleDeleteClick = (id: string) => {
    setItemToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;

    try {
      const res = await fetch(`/api/dashboard/social-links/${itemToDelete}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast.success('Social link deleted!');
        fetchSocialLinks();
      } else {
        toast.error('Failed to delete social link');
      }
    } catch (error) {
      toast.error('Error deleting social link');
    } finally {
      setItemToDelete(null);
      setDeleteModalOpen(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      url: '',
      icon: 'Globe',
      order: 0,
    });
    setEditingId(null);
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Manage Social Links</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{editingId ? 'Edit Social Link' : 'Add New Social Link'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., GitHub, LinkedIn"
                required
              />
            </div>

            <div>
              <Label htmlFor="url">URL</Label>
              <Input
                id="url"
                type="url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="https://example.com"
                required
              />
            </div>

            <div>
              <Label htmlFor="icon">Icon</Label>
              <Select
                value={formData.icon}
                onValueChange={(value) => setFormData({ ...formData, icon: value })}
              >
                <SelectTrigger id="icon">
                  <SelectValue placeholder="Select icon" />
                </SelectTrigger>
                <SelectContent>
                  {availableIcons.map((icon) => (
                    <SelectItem key={icon.value} value={icon.value}>
                      {icon.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="order">Order</Label>
              <Input
                id="order"
                type="number"
                value={formData.order}
                onChange={(e) =>
                  setFormData({ ...formData, order: parseInt(e.target.value) || 0 })
                }
                min="0"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Lower numbers appear first (0, 1, 2, ...)
              </p>
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
                    Add Link
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
          <CardTitle>All Social Links ({socialLinks.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {socialLinks.map((link) => (
              <div key={link._id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4 flex-1">
                  <div className="text-2xl font-bold text-muted-foreground w-8">
                    {link.order}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{link.name}</h3>
                    <p className="text-sm text-muted-foreground truncate max-w-md">{link.url}</p>
                    <p className="text-xs text-muted-foreground mt-1">Icon: {link.icon}</p>
                  </div>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
                <div className="flex gap-2 ml-4">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(link)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteClick(link._id!)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            {socialLinks.length === 0 && (
              <p className="text-center text-muted-foreground py-8">No social links added yet</p>
            )}
          </div>
        </CardContent>
      </Card>

      <ConfirmationModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        onConfirm={handleDelete}
        title="Delete Social Link"
        description="Are you sure you want to delete this social link? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />
    </div>
  );
}

