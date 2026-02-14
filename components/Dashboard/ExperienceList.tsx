import React from 'react';
import { ExperienceDetails } from '../../types';
import { ChevronRight } from 'lucide-react';

interface ExperienceListProps {
  experiences: ExperienceDetails[];
  category: string;
  onExperienceClick: (experience: ExperienceDetails) => void;
}

export const ExperienceList: React.FC<ExperienceListProps> = ({ experiences, category, onExperienceClick }) => {
  return (
    <div className="max-w-5xl mx-auto px-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-bored-gray-500 mb-6">
        <span>Catalog</span>
        <ChevronRight size={14} />
        <span className="font-medium text-bored-black">{category}</span>
      </nav>

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-light tracking-tight text-bored-black">{category}</h1>
          <p className="text-sm text-bored-gray-500">Manage your {category.toLowerCase()} offerings</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-3 bg-bored-black text-white rounded-xl hover:bg-bored-gray-800 text-sm font-medium transition-colors">
          + Add New Experience
        </button>
      </div>

      {/* Experiences Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {experiences.map((experience) => {
          const firstUnit = experience.units[0];
          return (
            <div
              key={experience.id}
              onClick={() => onExperienceClick(experience)}
              className="bg-white rounded-2xl border border-bored-gray-200 overflow-hidden hover:shadow-xl hover:border-bored-gray-300 transition-all cursor-pointer group"
            >
              {/* Image */}
              {firstUnit?.imageUrl && (
                <div className="h-48 w-full overflow-hidden bg-bored-gray-100">
                  <img
                    src={firstUnit.imageUrl}
                    alt={experience.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              )}

              {/* Content */}
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-bored-gray-50 text-bored-black border border-bored-gray-200">
                    {experience.status}
                  </span>
                  <span className="text-xs text-bored-gray-400 font-mono">
                    {experience.units.length} variants
                  </span>
                </div>

                <h3 className="text-lg font-medium text-bored-black mb-3 group-hover:text-bored-gray-900">
                  {experience.title}
                </h3>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-bored-gray-500">
                    From {firstUnit?.currency}{Math.min(...experience.units.map(u => u.price))}
                  </span>
                  <ChevronRight size={16} className="text-bored-gray-400 group-hover:text-bored-black transition-colors" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
