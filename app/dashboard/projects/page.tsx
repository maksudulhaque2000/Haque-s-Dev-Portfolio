'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Check, X, RefreshCw, Github, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';

interface Project {
  _id?: string;
  githubId: number;
  name: string;
  description: string;
  url?: string;
  technologies: string[];
  category: string;
  isApproved: boolean;
  githubUrl: string;
}

export default function ProjectsManagementPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [updatingImages, setUpdatingImages] = useState(false);
  const [updatingPercentages, setUpdatingPercentages] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/dashboard/projects');
      const data = await res.json();
      setProjects(data.projects || []);
    } catch (error) {
      toast.error('Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  const syncGitHub = async () => {
    setSyncing(true);
    try {
      const res = await fetch('/api/dashboard/projects/sync', {
        method: 'POST',
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Synced ${data.added || 0} new projects from GitHub!`);
        fetchProjects();
      } else {
        toast.error(data.error || 'Failed to sync');
      }
    } catch (error) {
      toast.error('Error syncing GitHub');
    } finally {
      setSyncing(false);
    }
  };

  const updateImages = async () => {
    setUpdatingImages(true);
    try {
      const res = await fetch('/api/dashboard/projects/update-images', {
        method: 'POST',
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Updated images for ${data.updated || 0} projects!`);
        fetchProjects();
      } else {
        toast.error(data.error || 'Failed to update images');
      }
    } catch (error) {
      toast.error('Error updating images');
    } finally {
      setUpdatingImages(false);
    }
  };

  const updateLanguagePercentages = async () => {
    setUpdatingPercentages(true);
    try {
      const res = await fetch('/api/dashboard/projects/update-language-percentages', {
        method: 'POST',
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Updated language percentages for ${data.updated || 0} projects!`);
        fetchProjects();
      } else {
        toast.error(data.error || 'Failed to update language percentages');
      }
    } catch (error) {
      toast.error('Error updating language percentages');
    } finally {
      setUpdatingPercentages(false);
    }
  };

  const toggleApproval = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/dashboard/projects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isApproved: !currentStatus }),
      });

      if (res.ok) {
        toast.success(`Project ${!currentStatus ? 'approved' : 'rejected'}!`);
        fetchProjects();
      } else {
        toast.error('Failed to update project');
      }
    } catch (error) {
      toast.error('Error updating project');
    }
  };

  const handleDeleteClick = (id: string) => {
    setItemToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;

    try {
      const res = await fetch(`/api/dashboard/projects/${itemToDelete}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast.success('Project deleted!');
        fetchProjects();
      } else {
        toast.error('Failed to delete project');
      }
    } catch (error) {
      toast.error('Error deleting project');
    } finally {
      setItemToDelete(null);
      setDeleteModalOpen(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  const approvedProjects = projects.filter((p) => p.isApproved);
  const pendingProjects = projects.filter((p) => !p.isApproved);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Manage Projects</h1>
        <div className="flex gap-2">
          <Button onClick={updateLanguagePercentages} disabled={updatingPercentages} variant="outline">
            <RefreshCw className={`mr-2 h-4 w-4 ${updatingPercentages ? 'animate-spin' : ''}`} />
            {updatingPercentages ? 'Updating...' : 'Update Tech %'}
          </Button>
          <Button onClick={updateImages} disabled={updatingImages} variant="outline">
            <RefreshCw className={`mr-2 h-4 w-4 ${updatingImages ? 'animate-spin' : ''}`} />
            {updatingImages ? 'Updating...' : 'Update Images'}
          </Button>
          <Button onClick={syncGitHub} disabled={syncing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing...' : 'Sync from GitHub'}
          </Button>
        </div>
      </div>

      {pendingProjects.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Pending Approval ({pendingProjects.length})</CardTitle>
            <CardDescription>Review and approve projects from GitHub</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingProjects.map((project) => (
                <div key={project._id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{project.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{project.description}</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {project.technologies.slice(0, 5).map((tech, idx) => (
                          <span key={idx} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded">
                            {tech}
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Link href={project.githubUrl} target="_blank">
                          <Button variant="outline" size="sm">
                            <Github className="h-4 w-4 mr-1" />
                            GitHub
                          </Button>
                        </Link>
                        {project.url && (
                          <Link href={project.url} target="_blank">
                            <Button variant="outline" size="sm">
                              <ExternalLink className="h-4 w-4 mr-1" />
                              Live
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleApproval(project._id!, false)}
                      >
                        <Check className="h-4 w-4 text-green-500" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteClick(project._id!)}
                      >
                        <X className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Approved Projects ({approvedProjects.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {approvedProjects.map((project) => (
              <div key={project._id} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold">{project.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {project.description}
                    </p>
                    <div className="flex gap-2 mt-3">
                      <Link href={project.githubUrl} target="_blank">
                        <Button variant="outline" size="sm">
                          <Github className="h-4 w-4 mr-1" />
                          GitHub
                        </Button>
                      </Link>
                      {project.url && (
                        <Link href={project.url} target="_blank">
                          <Button variant="outline" size="sm">
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Live
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleApproval(project._id!, true)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            {approvedProjects.length === 0 && (
              <p className="col-span-full text-center text-muted-foreground py-8">
                No approved projects yet
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <ConfirmationModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        onConfirm={handleDelete}
        title="Delete Project"
        description="Are you sure you want to delete this project? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />
    </div>
  );
}

