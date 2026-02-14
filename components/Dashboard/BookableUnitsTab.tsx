import React from 'react';
import { Plus } from 'lucide-react';
import { UnitCard } from './UnitCard';
import { BookableUnit } from '../../types';

interface BookableUnitsTabProps {
  units: BookableUnit[];
  onUnitClick?: (unit: BookableUnit) => void;
}

export const BookableUnitsTab: React.FC<BookableUnitsTabProps> = ({ units, onUnitClick }) => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto px-8 py-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-semibold text-bored-gray-500 uppercase tracking-wider">
          {units.length} Active Units
        </h3>
        {/* Optional Filter or Sort could go here */}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {units.map((unit) => (
          <UnitCard 
            key={unit.id} 
            unit={unit} 
            onClick={() => onUnitClick?.(unit)}
          />
        ))}
      </div>

      <div className="pt-4">
        <button className="w-full py-6 border-2 border-dashed border-bored-gray-200 rounded-2xl flex items-center justify-center gap-3 text-bored-gray-500 hover:text-bored-black hover:border-bored-gray-300 hover:bg-bored-gray-50 transition-all duration-200 group">
          <div className="w-10 h-10 rounded-full bg-bored-gray-100 flex items-center justify-center group-hover:bg-bored-gray-200">
             <Plus size={20} className="group-hover:text-black" />
          </div>
          <span className="font-medium">Add Unit</span>
        </button>
      </div>
    </div>
  );
};