import React from 'react';
import { BarChart3 } from 'lucide-react';

interface AnalyticsViewProps {
  hotelId: string | null;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = () => {
  return (
    <div className="max-w-7xl mx-auto px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-light tracking-tight text-bored-black mb-2">Analytics</h1>
        <p className="text-sm text-bored-gray-500">Performance metrics and trends</p>
      </div>
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <div className="w-14 h-14 bg-bored-gray-100 rounded-2xl flex items-center justify-center mb-5">
          <BarChart3 size={26} className="text-bored-gray-400" />
        </div>
        <h2 className="text-lg font-semibold text-bored-black mb-2">Analytics coming soon</h2>
        <p className="text-sm text-bored-gray-400 max-w-xs">
          Booking trends, revenue insights and guest demographics will be available here once data starts coming in.
        </p>
      </div>
    </div>
  );
};
