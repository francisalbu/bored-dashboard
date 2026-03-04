import React from 'react';
import { Star } from 'lucide-react';

interface ReviewsViewProps {
  hotelId: string | null;
}

export const ReviewsView: React.FC<ReviewsViewProps> = () => {
  return (
    <div className="max-w-6xl mx-auto px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-light tracking-tight text-bored-black mb-2">Reviews</h1>
        <p className="text-sm text-bored-gray-500">Guest reviews and ratings</p>
      </div>
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <div className="w-14 h-14 bg-bored-gray-100 rounded-2xl flex items-center justify-center mb-5">
          <Star size={26} className="text-bored-gray-400" />
        </div>
        <h2 className="text-lg font-semibold text-bored-black mb-2">No reviews yet</h2>
        <p className="text-sm text-bored-gray-400 max-w-xs">
          Guest reviews will appear here after experiences are booked and completed.
        </p>
      </div>
    </div>
  );
};
