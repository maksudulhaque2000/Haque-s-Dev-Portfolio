'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ExternalLink, Github, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type Category = 'all' | 'fullstack' | 'frontend' | 'backend' | 'other';

interface Project {
  _id: string;
  name: string;
  description: string;
  url?: string;
  homepage?: string;
  technologies: string[];
  category: string;
  githubUrl: string;
  image?: string;
  languagePercentages?: { [key: string]: number };
}

async function getProjects(): Promise<Project[]> {
  try {
    const res = await fetch('/api/projects');
    const data = await res.json();
    return data.projects || [];
  } catch (error) {
    console.error('Error fetching projects:', error);
    return [];
  }
}

export default function ProjectsSection() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<Category>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const projectsPerPage = 6;

  useEffect(() => {
    getProjects().then((data) => {
      setProjects(data);
      setLoading(false);
    });
  }, []);

  const filteredProjects = (activeCategory === 'all'
    ? projects
    : projects.filter((project) => project.category === activeCategory)
  ).filter((project) =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredProjects.length / projectsPerPage);
  const paginatedProjects = filteredProjects.slice(
    (currentPage - 1) * projectsPerPage,
    currentPage * projectsPerPage
  );

  const categories: { id: Category; label: string }[] = [
    { id: 'all', label: 'All Projects' },
    { id: 'fullstack', label: 'Full Stack' },
    { id: 'frontend', label: 'Frontend' },
    { id: 'backend', label: 'Backend' },
    { id: 'other', label: "Other's" },
  ];

  if (loading) {
    return (
      <section id="projects" className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Projects</h2>
            <div className="w-24 h-1 bg-primary mx-auto"></div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-muted animate-pulse rounded-lg"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="projects" className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Projects</h2>
          <div className="w-24 h-1 bg-primary mx-auto"></div>
        </div>

        {/* Search */}
        <div className="mb-8 max-w-md mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search projects by title..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10"
            />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => {
                setActiveCategory(category.id);
                setCurrentPage(1);
              }}
              className={`px-6 py-2 rounded font-medium transition-all relative ${
                activeCategory === category.id
                  ? 'bg-primary text-white shadow-lg scale-105 animated-border'
                  : 'bg-muted hover:bg-muted/80 text-foreground border border-border'
              }`}
            >
              {category.label}
              {activeCategory === category.id && (
                <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-white rounded-full"></span>
              )}
            </button>
          ))}
        </div>

        {/* Projects Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {paginatedProjects.map((project) => {
            // Only use homepage as liveUrl, not githubUrl
            const liveUrl = project.homepage || project.url;
            // Only show Live button if there's a valid homepage (not GitHub URL)
            const hasLiveLink = liveUrl && !liveUrl.includes('github.com');
            
            return (
              <div
                key={project._id}
                className="group relative bg-card border border-border rounded-lg overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 h-full flex flex-col"
              >
                {/* Project Image Container - Larger */}
                <div className="relative h-80 w-full overflow-hidden bg-muted flex-shrink-0">
                  <Image
                    src={project.image || '/server.png'}
                    alt={project.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    unoptimized
                    onError={(e) => {
                      // Fallback to server.png if image fails to load
                      const target = e.target as HTMLImageElement;
                      if (target.src !== '/server.png') {
                        target.src = '/server.png';
                      }
                    }}
                  />
                  
                  {/* Dark overlay on hover for better button visibility */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  {/* Buttons - Animated overlay on image */}
                  <div className="absolute inset-0 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
                    {hasLiveLink && (
                      <Link 
                        href={liveUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="group/btn"
                      >
                        <Button 
                          size="lg" 
                          className="bg-white text-gray-900 dark:bg-white dark:text-gray-900 hover:bg-gray-50 dark:hover:bg-gray-50 hover:text-gray-900 dark:hover:text-gray-900 hover:scale-110 hover:shadow-2xl active:scale-95 transition-all duration-300 font-bold border-2 border-white shadow-xl px-6 py-3"
                        >
                          <ExternalLink className="h-5 w-5 mr-2 text-gray-900 dark:text-gray-900 group-hover/btn:rotate-12 group-hover/btn:scale-110 transition-all duration-300" />
                          Live
                        </Button>
                      </Link>
                    )}
                    <Link 
                      href={project.githubUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="group/btn"
                    >
                      <Button 
                        size="lg" 
                        className="bg-white text-gray-900 dark:bg-white dark:text-gray-900 hover:bg-gray-50 dark:hover:bg-gray-50 hover:text-gray-900 dark:hover:text-gray-900 hover:scale-110 hover:shadow-2xl active:scale-95 transition-all duration-300 font-bold border-2 border-white/80 backdrop-blur-md shadow-xl px-6 py-3"
                      >
                        <Github className="h-5 w-5 mr-2 text-gray-900 dark:text-gray-900 group-hover/btn:rotate-12 group-hover/btn:scale-110 transition-all duration-300" />
                        Code
                      </Button>
                    </Link>
                  </div>
                </div>
                
                {/* Details Section - Always visible, no layout shift */}
                <div className="p-5 flex-shrink-0">
                  <h3 className="text-lg font-bold mb-3 line-clamp-1">{project.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{project.description}</p>
                  
                  {/* Technology Usage Percentages - Single Multi-colored Bar */}
                  {project.languagePercentages && Object.keys(project.languagePercentages).length > 0 && (
                    <div className="mb-3 space-y-2">
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Technology Usage
                      </h4>
                      
                      {/* Single Multi-colored Progress Bar */}
                      <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                        <div className="flex h-full">
                          {Object.entries(project.languagePercentages)
                            .sort(([, a], [, b]) => b - a) // Sort by percentage descending
                            .map(([lang, percentage], index) => {
                              // Color palette for technologies
                              const colors = [
                                '#3b82f6', // blue
                                '#10b981', // green
                                '#f59e0b', // amber
                                '#ef4444', // red
                                '#8b5cf6', // purple
                                '#06b6d4', // cyan
                                '#f97316', // orange
                                '#ec4899', // pink
                              ];
                              const color = colors[index % colors.length];
                              
                              return (
                                <div
                                  key={lang}
                                  className="h-full transition-all duration-500 ease-out"
                                  style={{
                                    width: `${percentage}%`,
                                    backgroundColor: color,
                                  }}
                                  title={`${lang}: ${percentage}%`}
                                />
                              );
                            })}
                        </div>
                      </div>
                      
                      {/* Legend - Color labels */}
                      <div className="flex flex-wrap gap-2 mt-2">
                        {Object.entries(project.languagePercentages)
                          .sort(([, a], [, b]) => b - a) // Sort by percentage descending
                          .map(([lang, percentage], index) => {
                            const colors = [
                              '#3b82f6', // blue
                              '#10b981', // green
                              '#f59e0b', // amber
                              '#ef4444', // red
                              '#8b5cf6', // purple
                              '#06b6d4', // cyan
                              '#f97316', // orange
                              '#ec4899', // pink
                            ];
                            const color = colors[index % colors.length];
                            
                            return (
                              <div key={lang} className="flex items-center gap-1.5">
                                <div
                                  className="w-3 h-3 rounded-sm flex-shrink-0"
                                  style={{ backgroundColor: color }}
                                />
                                <span className="text-xs font-medium text-foreground capitalize">
                                  {lang}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {percentage}%
                                </span>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  )}
                  
                  {/* Technology Tags */}
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.slice(0, 4).map((tech, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary text-xs rounded"
                      >
                        {tech}
                      </span>
                    ))}
                    {project.technologies.length > 4 && (
                      <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded">
                        +{project.technologies.length - 4}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            {[...Array(totalPages)].map((_, i) => (
              <Button
                key={i + 1}
                variant={currentPage === i + 1 ? 'default' : 'outline'}
                onClick={() => setCurrentPage(i + 1)}
                className="w-10"
              >
                {i + 1}
              </Button>
            ))}
            <Button
              variant="outline"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
