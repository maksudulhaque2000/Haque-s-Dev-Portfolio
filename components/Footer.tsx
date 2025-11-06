'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Mail,
  Github,
  Linkedin,
  Facebook,
  Instagram,
  Youtube,
  Twitter,
  Globe,
  MessageCircle,
  Phone,
  type LucideIcon,
} from 'lucide-react';

// Icon mapping
const iconMap: Record<string, LucideIcon> = {
  Mail,
  Github,
  Linkedin,
  Facebook,
  Instagram,
  Youtube,
  Twitter,
  Globe,
  MessageCircle,
  Phone,
};

interface SocialLink {
  _id: string;
  name: string;
  url: string;
  icon: string;
  order: number;
}

export default function Footer() {
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/social-links')
      .then((res) => res.json())
      .then((data) => {
        setSocialLinks(data.socialLinks || []);
      })
      .catch(() => {
        // Fallback to empty array on error
        setSocialLinks([]);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <footer className="border-t border-border bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col items-center space-y-6">
            <p className="text-sm text-muted-foreground">Loading...</p>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col items-center space-y-8">
          {/* Social Links */}
          {socialLinks.length > 0 && (
            <div className="flex items-center justify-center flex-wrap gap-4">
              {socialLinks.map((link) => {
                const Icon = iconMap[link.icon] || Globe;
                return (
                  <Link
                    key={link._id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative p-4 rounded-full bg-background hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:scale-110 shadow-md hover:shadow-xl border border-border animated-border"
                    aria-label={link.name}
                  >
                    <Icon className="h-6 w-6" />
                    {/* Tooltip */}
                    <span className="absolute -top-10 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-foreground text-background text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                      {link.name}
                    </span>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Copyright */}
          <p className="text-sm text-muted-foreground text-center">
            © 2025 Maksudul Haque. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
