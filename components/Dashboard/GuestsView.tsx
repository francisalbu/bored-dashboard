import React from 'react';
import { Users } from 'lucide-react';

export interface GuestsViewProps {
  hotelId: string | null;
}

export const GuestsView: React.FC<GuestsViewProps> = () => {
  return (
    <div className="max-w-7xl mx-auto px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-light tracking-tight text-bored-black mb-2">Guests</h1>
        <p className="text-sm text-bored-gray-500">Guest profiles and history</p>
      </div>
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <div className="w-14 h-14 bg-bored-gray-100 rounded-2xl flex items-center justify-center mb-5">
          <Users size={26} className="text-bored-gray-400" />
        </div>
        <h2 className="text-lg font-semibold text-bored-black mb-2">No guests yet</h2>
        <p className="text-sm text-bored-gray-400 max-w-xs">
          Guest profiles will be created automatically when bookings are made through your experience page.
        </p>
      </div>
    </div>
  );
};
