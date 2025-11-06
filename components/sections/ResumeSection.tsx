'use client';

import { useState, useEffect } from 'react';
import { Briefcase, GraduationCap, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Experience {
  _id: string;
  title: string;
  company: string;
  location: string;
  period: string;
  description: string[];
  technologies: string[];
}

interface Education {
  _id: string;
  degree: string;
  institution: string;
  duration: string;
  description: string;
  achievements: string[];
  certificate?: string;
}

export default function ResumeSection() {
  return <ResumeSectionClient />;
}

function ResumeSectionClient() {
  const [activeTab, setActiveTab] = useState<'experience' | 'education'>('experience');
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [educations, setEducations] = useState<Education[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/experience').then((res) => res.json()),
      fetch('/api/education').then((res) => res.json()),
    ])
      .then(([expData, eduData]) => {
        setExperiences(expData.experiences || []);
        setEducations(eduData.educations || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Handle hash changes to set active tab
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      
      if (hash === '#resume-experience') {
        setActiveTab('experience');
      } else if (hash === '#resume-education') {
        setActiveTab('education');
      } else if (hash === '#resume') {
        // Default to experience if just #resume
        setActiveTab('experience');
      }
    };

    // Check on mount
    handleHashChange();

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const handleViewCertificate = (certificate?: string) => {
    if (certificate) {
      // Extract filename from path if it's a full path
      const filename = certificate.startsWith('/certificates/')
        ? certificate.replace('/certificates/', '')
        : certificate;
      window.open(`/certificates/${filename}`, '_blank');
    }
  };

  return (
    <section id="resume" className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Resume</h2>
          <div className="w-24 h-1 bg-primary mx-auto"></div>
        </div>

        {/* Tabs */}
        <div className="flex justify-center gap-4 mb-12">
          <button
            onClick={() => {
              setActiveTab('experience');
              // Update URL hash
              window.history.replaceState(null, '', '#resume-experience');
            }}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all relative ${
              activeTab === 'experience'
                ? 'bg-primary text-primary-foreground shadow-xl scale-105 border border-primary animated-border'
                : 'bg-background hover:bg-muted text-muted-foreground border border-border hover:border-primary/50'
            }`}
          >
            <Briefcase className={`h-5 w-5 ${activeTab === 'experience' ? 'text-primary-foreground' : ''}`} />
            Experience
            {activeTab === 'experience' && (
              <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-16 h-1.5 bg-primary-foreground rounded-full shadow-lg"></span>
            )}
          </button>
          <button
            onClick={() => {
              setActiveTab('education');
              // Update URL hash
              window.history.replaceState(null, '', '#resume-education');
            }}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all relative ${
              activeTab === 'education'
                ? 'bg-primary text-primary-foreground shadow-xl scale-105 border border-primary animated-border'
                : 'bg-background hover:bg-muted text-muted-foreground border border-border hover:border-primary/50'
            }`}
          >
            <GraduationCap className={`h-5 w-5 ${activeTab === 'education' ? 'text-primary-foreground' : ''}`} />
            Education
            {activeTab === 'education' && (
              <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-16 h-1.5 bg-primary-foreground rounded-full shadow-lg"></span>
            )}
          </button>
        </div>

        {/* Content */}
        <div className="space-y-8">
          {activeTab === 'experience' && (
            <div className="space-y-8">
              {experiences.length === 0 ? (
                <p className="text-center text-muted-foreground">No experience added yet.</p>
              ) : (
                experiences.map((exp) => (
                  <div key={exp._id} className="bg-card p-6 rounded-lg shadow-md border border-border">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                      <div>
                        <h3 className="text-2xl font-bold">{exp.title}</h3>
                        <p className="text-lg text-primary">{exp.company}</p>
                        <p className="text-muted-foreground">{exp.location}</p>
                      </div>
                      <span className="text-muted-foreground mt-2 md:mt-0">{exp.period}</span>
                    </div>
                    <ul className="list-disc list-inside space-y-2 mb-4">
                      {exp.description.map((desc, idx) => (
                        <li key={idx} className="text-foreground/80">
                          {desc}
                        </li>
                      ))}
                    </ul>
                    <div className="flex flex-wrap gap-2">
                      {exp.technologies.map((tech, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'education' && (
            <div className="space-y-8">
              {educations.length === 0 ? (
                <p className="text-center text-muted-foreground">No education added yet.</p>
              ) : (
                educations.map((edu) => (
                  <div
                    key={edu._id}
                    className="bg-card p-6 rounded-lg shadow-md border border-border"
                  >
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                      <div>
                        <h3 className="text-2xl font-bold">{edu.degree}</h3>
                        <p className="text-lg text-primary">{edu.institution}</p>
                      </div>
                      <span className="text-muted-foreground mt-2 md:mt-0">{edu.duration}</span>
                    </div>
                    <p className="text-foreground/80 mb-4">{edu.description}</p>
                    {edu.achievements && edu.achievements.length > 0 && (
                      <ul className="list-disc list-inside space-y-1 mb-4">
                        {edu.achievements.map((achievement, idx) => (
                          <li key={idx} className="text-foreground/80">
                            {achievement}
                          </li>
                        ))}
                      </ul>
                    )}
                    {edu.certificate && (
                      <Button
                        variant="outline"
                        onClick={() => handleViewCertificate(edu.certificate)}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Certificate
                      </Button>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
