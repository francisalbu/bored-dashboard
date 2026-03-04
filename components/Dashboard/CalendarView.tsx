import React from 'react';
import { CalendarDays } from 'lucide-react';

export interface CalendarViewProps {
  hotelId: string | null;
}

export const CalendarView: React.FC<CalendarViewProps> = () => {
  return (
    <div className="max-w-7xl mx-auto px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-light tracking-tight text-bored-black mb-2">Calendar</h1>
        <p className="text-sm text-bored-gray-500">View and manage all your experience bookings</p>
      </div>
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <div className="w-14 h-14 bg-bored-gray-100 rounded-2xl flex items-center justify-center mb-5">
          <CalendarDays size={26} className="text-bored-gray-400" />
        </div>
        <h2 className="text-lg font-semibold text-bored-black mb-2">No bookings yet</h2>
        <p className="text-sm text-bored-gray-400 max-w-xs">
          Confirmed bookings will appear on the calendar once guests start booking your experiences.
        </p>
      </div>
    </div>
  );
};
