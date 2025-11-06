'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Plus, Trash2, Edit, Save, X } from 'lucide-react';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';

interface Experience {
  _id?: string;
  title: string;
  company: string;
  location: string;
  period: string;
  description: string[];
  technologies: string[];
}

export default function ExperienceManagementPage() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Experience>({
    title: '',
    company: '',
    location: '',
    period: '',
    description: [''],
    technologies: [],
  });
  const [newDescription, setNewDescription] = useState('');
  const [newTech, setNewTech] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchExperiences();
  }, []);

  const fetchExperiences = async () => {
    try {
      const res = await fetch('/api/dashboard/experience');
      const data = await res.json();
      setExperiences(data.experiences || []);
    } catch (error) {
      toast.error('Failed to fetch experiences');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingId
        ? `/api/dashboard/experience/${editingId}`
        : '/api/dashboard/experience';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success(editingId ? 'Experience updated!' : 'Experience added!');
        resetForm();
        fetchExperiences();
      } else {
        toast.error('Failed to save experience');
      }
    } catch (error) {
      toast.error('Error saving experience');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      company: '',
      location: '',
      period: '',
      description: [''],
      technologies: [],
    });
    setEditingId(null);
    setNewDescription('');
    setNewTech('');
  };

  const handleEdit = (exp: Experience) => {
    setFormData(exp);
    setEditingId(exp._id || null);
  };

  const handleDeleteClick = (id: string) => {
    setItemToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;

    try {
      const res = await fetch(`/api/dashboard/experience/${itemToDelete}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast.success('Experience deleted!');
        fetchExperiences();
      } else {
        toast.error('Failed to delete experience');
      }
    } catch (error) {
      toast.error('Error deleting experience');
    } finally {
      setItemToDelete(null);
      setDeleteModalOpen(false);
    }
  };

  const addDescription = () => {
    if (newDescription.trim()) {
      setFormData({
        ...formData,
        description: [...formData.description, newDescription],
      });
      setNewDescription('');
    }
  };

  const removeDescription = (index: number) => {
    setFormData({
      ...formData,
      description: formData.description.filter((_, i) => i !== index),
    });
  };

  const addTechnology = () => {
    if (newTech.trim()) {
      setFormData({
        ...formData,
        technologies: [...formData.technologies, newTech.trim()],
      });
      setNewTech('');
    }
  };

  const removeTechnology = (index: number) => {
    setFormData({
      ...formData,
      technologies: formData.technologies.filter((_, i) => i !== index),
    });
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Manage Experience</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{editingId ? 'Edit Experience' : 'Add New Experience'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Job Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="period">Period</Label>
                <Input
                  id="period"
                  value={formData.period}
                  onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                  placeholder="Jan 2020 - Present"
                  required
                />
              </div>
            </div>

            <div>
              <Label>Description Points</Label>
              <div className="space-y-2 mt-2">
                {formData.description.map((desc, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={desc}
                      onChange={(e) => {
                        const newDesc = [...formData.description];
                        newDesc[index] = e.target.value;
                        setFormData({ ...formData, description: newDesc });
                      }}
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeDescription(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <Input
                    placeholder="Add description point"
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addDescription())}
                  />
                  <Button type="button" onClick={addDescription}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div>
              <Label>Technologies</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.technologies.map((tech, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm flex items-center gap-2"
                  >
                    {tech}
                    <button
                      type="button"
                      onClick={() => removeTechnology(index)}
                      className="hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                <div className="flex gap-2">
                  <Input
                    placeholder="Add technology"
                    value={newTech}
                    onChange={(e) => setNewTech(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTechnology())}
                    className="w-32"
                  />
                  <Button type="button" onClick={addTechnology}>
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
                    Add Experience
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
          <CardTitle>All Experiences ({experiences.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {experiences.map((exp) => (
              <div key={exp._id} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{exp.title}</h3>
                    <p className="text-muted-foreground">{exp.company} • {exp.location}</p>
                    <p className="text-sm text-muted-foreground mt-1">{exp.period}</p>
                    <ul className="list-disc list-inside mt-2 text-sm">
                      {exp.description.map((desc, idx) => (
                        <li key={idx}>{desc}</li>
                      ))}
                    </ul>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {exp.technologies.map((tech, idx) => (
                        <span key={idx} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(exp)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteClick(exp._id!)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {experiences.length === 0 && (
              <p className="text-center text-muted-foreground py-8">No experiences added yet</p>
            )}
          </div>
        </CardContent>
      </Card>

      <ConfirmationModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        onConfirm={handleDelete}
        title="Delete Experience"
        description="Are you sure you want to delete this experience? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />
    </div>
  );
}

