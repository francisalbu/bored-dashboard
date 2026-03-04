import React from 'react';
import { DollarSign } from 'lucide-react';

interface EarningsViewProps {
  hotelId: string | null;
}

export const EarningsView: React.FC<EarningsViewProps> = () => {
  return (
    <div className="max-w-7xl mx-auto px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-light tracking-tight text-bored-black mb-2">Earnings</h1>
        <p className="text-sm text-bored-gray-500">Track your revenue and payouts</p>
      </div>
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <div className="w-14 h-14 bg-bored-gray-100 rounded-2xl flex items-center justify-center mb-5">
          <DollarSign size={26} className="text-bored-gray-400" />
        </div>
        <h2 className="text-lg font-semibold text-bored-black mb-2">No earnings yet</h2>
        <p className="text-sm text-bored-gray-400 max-w-xs">
          Your revenue, payouts and monthly trends will appear here once you start receiving bookings.
        </p>
      </div>
    </div>
  );
};
