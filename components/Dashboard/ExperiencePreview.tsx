import React from 'react';
import { ExperienceDetails } from '../../types';
import { Pen, Eye, MapPin, Calendar, Users } from 'lucide-react';

interface ExperiencePreviewProps {
  experience: ExperienceDetails;
  onEdit: () => void;
  onBack: () => void;
}

export const ExperiencePreview: React.FC<ExperiencePreviewProps> = ({ experience, onEdit, onBack }) => {
  const firstUnit = experience.units[0];
  
  return (
    <div className="max-w-4xl mx-auto px-8">
      {/* Back button */}
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-bored-gray-500 hover:text-bored-black mb-6 transition-colors"
      >
        ← {experience.category}
      </button>

      {/* Header with title and actions */}
      <div className="flex items-start justify-between mb-8">
        <h1 className="text-3xl font-light tracking-tight text-bored-black">{experience.title}</h1>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-3 text-sm border border-bored-gray-200 rounded-xl hover:bg-bored-gray-50 transition-colors">
            <Eye size={16} />
            Preview
          </button>
          <button 
            onClick={onEdit}
            className="flex items-center gap-2 px-4 py-3 text-sm bg-bored-black text-white rounded-xl hover:bg-bored-gray-800 transition-colors"
          >
            <Pen size={16} />
            Edit
          </button>
        </div>
      </div>

      {/* Hero Image and Description */}
      {firstUnit?.imageUrl && (
        <div className="mb-8">
          <img 
            src={firstUnit.imageUrl} 
            alt={experience.title}
            className="w-full h-64 object-cover rounded-2xl"
          />
        </div>
      )}

      {/* Description */}
      <div className="bg-white rounded-2xl border border-bored-gray-200 p-8 mb-8">
        <h2 className="text-lg font-semibold text-bored-black mb-4">What you'll do</h2>
        <p className="text-bored-gray-700 leading-relaxed mb-6">
          Experience the thrill of mountain biking through rugged trails and scenic landscapes, 
          guided by an experienced professional. Conquer challenging terrains, explore hidden paths, 
          and immerse yourself in the beauty of nature.
        </p>
        
        <div className="flex items-center gap-4 text-sm text-bored-gray-600">
          <div className="flex items-center gap-1">
            <MapPin size={16} />
            <span>St Lucia, 3936, South Africa</span>
          </div>
        </div>
      </div>

      {/* Dates & Rates Section */}
      <div className="bg-white rounded-2xl border border-bored-gray-200 p-8 mb-8">
        <h2 className="text-lg font-semibold text-bored-black mb-2">Dates & Rates</h2>
        <p className="text-sm text-bored-gray-500 mb-6">
          Control dates on which your experience is selling, bookable units and prices.
        </p>

        {/* Availability Source */}
        <div className="mb-6">
          <label className="block text-xs font-semibold text-bored-gray-500 mb-2 uppercase tracking-wide">
            Availability source
          </label>
          <select className="w-full px-4 py-3 border border-bored-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-bored-neon transition-all">
            <option value="bored">bored.</option>
            <option value="turneo">Turneo</option>
          </select>
        </div>

        {/* Units List */}
        <div className="space-y-4">
          {experience.units.map((unit) => (
            <div 
              key={unit.id}
              className="flex items-center justify-between p-6 border border-bored-gray-200 rounded-xl hover:bg-bored-gray-50 transition-colors"
            >
              <div className="flex-1">
                <h3 className="font-medium text-bored-black mb-1">{unit.name}</h3>
                <div className="flex items-center gap-4 text-sm text-bored-gray-500">
                  <span>{unit.currency}{unit.price} EUR</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Calendar size={14} />
                    {unit.duration}
                  </span>
                  <span>•</span>
                  <span>{unit.instantBooking ? 'Instant booking' : 'Request booking'}</span>
                </div>
                <div className="mt-2">
                  <span className="text-xs text-bored-gray-500">Availability: </span>
                  <div className="inline-flex gap-1 ml-2">
                    {unit.activeDays.map((day) => (
                      <span 
                        key={day}
                        className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-bored-black text-white text-xs font-semibold"
                      >
                        {day}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 text-bored-gray-400 hover:text-bored-gray-600">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 4V8L10.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5"/>
                  </svg>
                </button>
                <button className="p-2 text-bored-gray-400 hover:text-bored-gray-600">
                  <Pen size={16} />
                </button>
                <button className="p-2 text-bored-gray-400 hover:text-bored-gray-600">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 4H13M5 4V3C5 2.44772 5.44772 2 6 2H10C10.5523 2 11 2.44772 11 3V4M6.5 7.5V11.5M9.5 7.5V11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M4 4V13C4 13.5523 4.44772 14 5 14H11C11.5523 14 12 13.5523 12 13V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        <button className="mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium">
          + Extend rates
        </button>
      </div>
    </div>
  );
};
