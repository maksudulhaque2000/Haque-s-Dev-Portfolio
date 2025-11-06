'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { Moon, Sun, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { name: 'About', href: '#about' },
  { name: 'Skills', href: '#skills' },
  { name: 'Projects', href: '#projects' },
  { name: 'Experience', href: '#resume-experience' },
  { name: 'Education', href: '#resume-education' },
  { name: 'Blogs', href: '#blogs' },
  { name: 'Contact', href: '#contact' },
];

export default function Navbar() {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [prevTheme, setPrevTheme] = useState<'light' | 'dark'>('light');
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Use a default theme during SSR to avoid hydration mismatch
  const displayTheme = (mounted ? theme : 'light') as 'light' | 'dark';

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        mounted && scrolled
          ? 'bg-background/80 backdrop-blur-md shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link
            href="/"
            className="text-xl md:text-2xl font-bold text-foreground hover:text-primary transition-colors"
          >
            Maksudul Haque
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={(e) => {
                  // Handle experience and education navigation
                  if (item.href === '#resume-experience' || item.href === '#resume-education') {
                    e.preventDefault();
                    // Scroll to resume section
                    const resumeSection = document.getElementById('resume');
                    if (resumeSection) {
                      resumeSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      // Update hash after scroll
                      setTimeout(() => {
                        window.location.hash = item.href;
                      }, 100);
                    }
                  }
                }}
                className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors relative px-2 py-1 rounded-md hover:bg-muted/50"
              >
                {item.name}
              </Link>
            ))}
            <button
              onClick={() => {
                if (!isAnimating) {
                  setPrevTheme(displayTheme);
                  setIsAnimating(true);
                  setTheme(displayTheme === 'dark' ? 'light' : 'dark');
                  setTimeout(() => setIsAnimating(false), 500);
                }
              }}
              className="p-0 rounded-lg hover:bg-muted transition-colors"
              aria-label="Toggle theme"
            >
              <div className="theme-icon-container">
                <Sun 
                  className={`h-5 w-5 theme-icon ${
                    isAnimating && prevTheme === 'dark' ? 'sun-enter' : 
                    isAnimating && prevTheme === 'light' ? 'sun-exit' : ''
                  }`}
                  style={!isAnimating && displayTheme === 'light' ? { opacity: 1, transform: 'translateY(0) rotate(0deg)' } : {}}
                />
                <Moon 
                  className={`h-5 w-5 theme-icon ${
                    isAnimating && prevTheme === 'dark' ? 'moon-exit' : 
                    isAnimating && prevTheme === 'light' ? 'moon-enter' : ''
                  }`}
                  style={!isAnimating && displayTheme === 'dark' ? { opacity: 1, transform: 'translateY(0) rotate(0deg)' } : {}}
                />
              </div>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center space-x-4 md:hidden">
            <button
              onClick={() => {
                if (!isAnimating) {
                  setPrevTheme(displayTheme);
                  setIsAnimating(true);
                  setTheme(displayTheme === 'dark' ? 'light' : 'dark');
                  setTimeout(() => setIsAnimating(false), 500);
                }
              }}
              className="p-0 rounded-lg hover:bg-muted transition-colors"
              aria-label="Toggle theme"
            >
              <div className="theme-icon-container">
                <Sun 
                  className={`h-5 w-5 theme-icon ${
                    isAnimating && prevTheme === 'dark' ? 'sun-enter' : 
                    isAnimating && prevTheme === 'light' ? 'sun-exit' : ''
                  }`}
                  style={!isAnimating && displayTheme === 'light' ? { opacity: 1, transform: 'translateY(0) rotate(0deg)' } : {}}
                />
                <Moon 
                  className={`h-5 w-5 theme-icon ${
                    isAnimating && prevTheme === 'dark' ? 'moon-exit' : 
                    isAnimating && prevTheme === 'light' ? 'moon-enter' : ''
                  }`}
                  style={!isAnimating && displayTheme === 'dark' ? { opacity: 1, transform: 'translateY(0) rotate(0deg)' } : {}}
                />
              </div>
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden overflow-hidden"
            >
              <div className="py-4 space-y-2">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={(e) => {
                      setIsOpen(false);
                      // Handle experience and education navigation
                      if (item.href === '#resume-experience' || item.href === '#resume-education') {
                        e.preventDefault();
                        // Scroll to resume section
                        const resumeSection = document.getElementById('resume');
                        if (resumeSection) {
                          resumeSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          // Update hash after scroll
                          setTimeout(() => {
                            window.location.hash = item.href;
                          }, 100);
                        }
                      }
                    }}
                    className="block px-4 py-2 text-base font-medium text-foreground/80 hover:text-primary hover:bg-muted rounded-lg transition-colors"
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
