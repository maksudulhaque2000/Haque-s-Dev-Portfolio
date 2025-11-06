'use client';

import { useState } from 'react';

type Category = 'all' | 'frontend' | 'backend' | 'other';

export default function SkillsSectionClient({ skills }: { skills: any[] }) {
  const [activeCategory, setActiveCategory] = useState<Category>('all');

  const filteredSkills =
    activeCategory === 'all'
      ? [...skills].sort((a, b) => {
          // Sort by category: frontend first, then backend, then other
          const categoryOrder: { [key: string]: number } = {
            frontend: 1,
            backend: 2,
            other: 3,
          };
          return (categoryOrder[a.category] || 99) - (categoryOrder[b.category] || 99);
        })
      : skills.filter((skill) => skill.category === activeCategory);

  const categories: { id: Category; label: string; color: string }[] = [
    { id: 'all', label: 'All Skills', color: 'bg-primary' },
    { id: 'frontend', label: 'Frontend', color: 'bg-blue-500' },
    { id: 'backend', label: 'Backend', color: 'bg-green-500' },
    { id: 'other', label: "Other's", color: 'bg-purple-500' },
  ];

  return (
    <section id="skills" className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Skills</h2>
          <div className="w-24 h-1 bg-primary mx-auto"></div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-6 py-2 rounded font-medium transition-all relative ${
                activeCategory === category.id
                  ? `${category.color} text-white shadow-lg scale-105 animated-border`
                  : 'bg-background hover:bg-muted text-foreground border border-border'
              }`}
            >
              {category.label}
              {activeCategory === category.id && (
                <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-white rounded-full"></span>
              )}
            </button>
          ))}
        </div>

        {/* Skills Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredSkills.map((skill) => (
            <div
              key={skill._id}
              className="p-6 bg-background rounded-lg shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 border border-border text-center"
            >
              <div
                className={`text-2xl font-bold mb-2 ${
                  skill.category === 'frontend'
                    ? 'text-blue-500'
                    : skill.category === 'backend'
                    ? 'text-green-500'
                    : 'text-purple-500'
                }`}
              >
                {skill.name}
              </div>
              <div
                className={`w-full h-1 rounded-full mt-2 ${
                  skill.category === 'frontend'
                    ? 'bg-blue-500'
                    : skill.category === 'backend'
                    ? 'bg-green-500'
                    : 'bg-purple-500'
                }`}
              ></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
