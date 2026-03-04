import React from 'react';
import { LayoutDashboard } from 'lucide-react';

interface HomeViewProps {
  hotelId: string | null;
}

export const HomeView: React.FC<HomeViewProps> = () => {
  return (
    <div className="max-w-7xl mx-auto px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-light tracking-tight text-bored-black mb-2">Home</h1>
        <p className="text-sm text-bored-gray-500">Your dashboard overview</p>
      </div>
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <div className="w-14 h-14 bg-bored-gray-100 rounded-2xl flex items-center justify-center mb-5">
          <LayoutDashboard size={26} className="text-bored-gray-400" />
        </div>
        <h2 className="text-lg font-semibold text-bored-black mb-2">Overview coming soon</h2>
        <p className="text-sm text-bored-gray-400 max-w-xs">
          Your booking summary, recent activity and guest reviews will appear here once you start receiving bookings.
        </p>
      </div>
    </div>
  );
};
