import React from 'react';
import { MoreHorizontal, Zap } from 'lucide-react';
import { BookableUnit, AvailabilityDay } from '../../types';

interface UnitCardProps {
  unit: BookableUnit;
  onClick?: () => void;
}

const WEEK_DAYS: AvailabilityDay[] = ['M', 'T', 'W', 'Th', 'F', 'S', 'Su'];

export const UnitCard: React.FC<UnitCardProps> = ({ unit, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className="bg-white border border-bored-gray-200 rounded-2xl overflow-hidden hover:shadow-lg hover:border-bored-gray-300 transition-all duration-200 group cursor-pointer"
    >
      
      {/* Image Section */}
      {unit.imageUrl && (
        <div className="relative h-48 w-full overflow-hidden bg-bored-gray-100">
          <img 
            src={unit.imageUrl} 
            alt={unit.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {unit.instantBooking && (
            <div className="absolute top-3 right-3 flex items-center gap-1.5 text-amber-600 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-medium shadow-sm">
              <Zap size={14} fill="currentColor" />
              <span>Instant</span>
            </div>
          )}
        </div>
      )}

      {/* Content Section */}
      <div className="p-6">
        {/* Top: Unit Name & Duration */}
        <div className="mb-4">
          <h3 className="text-lg font-medium text-bored-black mb-1">{unit.name}</h3>
          {unit.duration && (
            <p className="text-sm text-bored-gray-500">
              {unit.duration}
            </p>
          )}
        </div>

        {/* Availability Grid */}
        <div className="mb-4">
          <p className="text-xs font-semibold text-bored-gray-500 uppercase tracking-wider mb-3">Availability</p>
          <div className="flex items-center gap-2">
            {WEEK_DAYS.map((day) => {
              const isActive = unit.activeDays.includes(day);
              return (
                <div 
                  key={day}
                  className={`w-9 h-9 flex items-center justify-center text-xs rounded-lg transition-colors font-medium
                    ${isActive 
                      ? 'text-white bg-bored-black' 
                      : 'text-bored-gray-300 bg-bored-gray-50'
                    }`}
                >
                  {day === 'Th' ? 'T' : day.charAt(0)}
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom: Price & Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-bored-gray-100">
          <div>
            <span className="block text-2xl font-light text-bored-black">
              {unit.currency}{unit.price.toFixed(2)}
            </span>
            <span className="text-xs text-bored-gray-500 uppercase tracking-wide">per person</span>
          </div>

          <button className="p-2 hover:bg-bored-gray-50 rounded-xl text-bored-gray-400 hover:text-bored-black transition-colors">
            <MoreHorizontal size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};