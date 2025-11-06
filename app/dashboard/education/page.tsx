'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Plus, Trash2, Edit, Save, X, Upload, FileText } from 'lucide-react';
import Image from 'next/image';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';

interface Education {
  _id?: string;
  degree: string;
  institution: string;
  duration: string;
  description: string;
  achievements: string[];
  certificate?: string;
}

export default function EducationManagementPage() {
  const [educations, setEducations] = useState<Education[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Education>({
    degree: '',
    institution: '',
    duration: '',
    description: '',
    achievements: [],
  });
  const [newAchievement, setNewAchievement] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchEducations();
  }, []);

  const fetchEducations = async () => {
    try {
      const res = await fetch('/api/dashboard/education');
      const data = await res.json();
      setEducations(data.educations || []);
    } catch (error) {
      toast.error('Failed to fetch educations');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, id?: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'certificate');

    try {
      const res = await fetch('/api/dashboard/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        if (id && editingId === id) {
          setFormData((prev) => ({ ...prev, certificate: data.url }));
        }
        toast.success('Certificate uploaded successfully!');
      } else {
        toast.error('Failed to upload certificate');
      }
    } catch (error) {
      toast.error('Error uploading certificate');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingId
        ? `/api/dashboard/education/${editingId}`
        : '/api/dashboard/education';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success(editingId ? 'Education updated!' : 'Education added!');
        resetForm();
        fetchEducations();
      } else {
        toast.error('Failed to save education');
      }
    } catch (error) {
      toast.error('Error saving education');
    }
  };

  const resetForm = () => {
    setFormData({
      degree: '',
      institution: '',
      duration: '',
      description: '',
      achievements: [],
    });
    setEditingId(null);
    setNewAchievement('');
  };

  const handleEdit = (edu: Education) => {
    setFormData(edu);
    setEditingId(edu._id || null);
  };

  const handleDeleteClick = (id: string) => {
    setItemToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;

    try {
      const res = await fetch(`/api/dashboard/education/${itemToDelete}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast.success('Education deleted!');
        fetchEducations();
      } else {
        toast.error('Failed to delete education');
      }
    } catch (error) {
      toast.error('Error deleting education');
    } finally {
      setItemToDelete(null);
      setDeleteModalOpen(false);
    }
  };

  const addAchievement = () => {
    if (newAchievement.trim()) {
      setFormData({
        ...formData,
        achievements: [...formData.achievements, newAchievement.trim()],
      });
      setNewAchievement('');
    }
  };

  const removeAchievement = (index: number) => {
    setFormData({
      ...formData,
      achievements: formData.achievements.filter((_, i) => i !== index),
    });
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Manage Education</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{editingId ? 'Edit Education' : 'Add New Education'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="degree">Degree</Label>
                <Input
                  id="degree"
                  value={formData.degree}
                  onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="institution">Institution</Label>
                <Input
                  id="institution"
                  value={formData.institution}
                  onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="duration">Duration</Label>
              <Input
                id="duration"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="2020 - 2024"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                required
              />
            </div>

            <div>
              <Label>Certificate</Label>
              {formData.certificate && (
                <div className="mt-2 mb-2">
                  <a
                    href={formData.certificate}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-primary hover:underline"
                  >
                    <FileText className="h-4 w-4" />
                    View Certificate
                  </a>
                </div>
              )}
              <Input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={(e) => handleFileUpload(e, editingId || undefined)}
                className="w-auto"
              />
            </div>

            <div>
              <Label>Achievements</Label>
              <div className="space-y-2 mt-2">
                {formData.achievements.map((ach, index) => (
                  <div key={index} className="flex gap-2">
                    <Input value={ach} readOnly />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeAchievement(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <Input
                    placeholder="Add achievement"
                    value={newAchievement}
                    onChange={(e) => setNewAchievement(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAchievement())}
                  />
                  <Button type="button" onClick={addAchievement}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
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
                    Add Education
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
          <CardTitle>All Education ({educations.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {educations.map((edu) => (
              <div key={edu._id} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{edu.degree}</h3>
                    <p className="text-muted-foreground">{edu.institution}</p>
                    <p className="text-sm text-muted-foreground mt-1">{edu.duration}</p>
                    <p className="text-sm mt-2">{edu.description}</p>
                    {edu.achievements.length > 0 && (
                      <ul className="list-disc list-inside mt-2 text-sm">
                        {edu.achievements.map((ach, idx) => (
                          <li key={idx}>{ach}</li>
                        ))}
                      </ul>
                    )}
                    {edu.certificate && (
                      <a
                        href={edu.certificate}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-primary hover:underline mt-2"
                      >
                        <FileText className="h-4 w-4" />
                        View Certificate
                      </a>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(edu)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteClick(edu._id!)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {educations.length === 0 && (
              <p className="text-center text-muted-foreground py-8">No education entries yet</p>
            )}
          </div>
        </CardContent>
      </Card>

      <ConfirmationModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        onConfirm={handleDelete}
        title="Delete Education"
        description="Are you sure you want to delete this education? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />
    </div>
  );
}

