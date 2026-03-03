import React from 'react';
import { Search, SlidersHorizontal, Star } from 'lucide-react';
import { Review } from '../../types';

interface ReviewsViewProps {
  hotelId: string | null;
}

export const ReviewsView: React.FC<ReviewsViewProps> = ({ hotelId: _hotelId }) => {
  // Mock Data for Reviews
  const reviews: Review[] = [
    {
      id: 'r1',
      experienceTitle: 'VIP Dinner @ Jade Beach',
      rating: 5,
      author: 'Matija',
      location: 'Jade Hotels',
      date: '28 Feb 2024',
      text: "Truly delicious and an unforgettable experience watching the sunset from our private balcony table. Thank you!",
      status: 'Published',
      imageUrl: 'https://images.unsplash.com/photo-1544148103-0773bf10d330?auto=format&fit=crop&q=80&w=150&h=150'
    },
    {
      id: 'r2',
      experienceTitle: 'VIP Dinner @ Jade Beach',
      rating: 5,
      author: 'Matija',
      location: 'Jade Hotels',
      date: '03 Feb 2024',
      text: "It was spectacular!",
      status: 'Published',
      imageUrl: 'https://images.unsplash.com/photo-1544148103-0773bf10d330?auto=format&fit=crop&q=80&w=150&h=150'
    },
    {
      id: 'r3',
      experienceTitle: 'Day Spa Package',
      rating: 5,
      author: 'Matija',
      location: 'Jade Beach Resort',
      date: '22 Nov 2023',
      text: "This was the most relaxing spa day I've ever had. The pools and hot tubs were amazing, all with a beautiful view of the ocean. 5 starts!",
      status: 'Published',
      imageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=150&h=150'
    },
    {
      id: 'r4',
      experienceTitle: 'Free Sunrise Yoga',
      rating: 5,
      author: 'Matija',
      location: 'Jade Beach Resort',
      date: '15 Nov 2023',
      text: "Excellent experience on offer. Would come again.",
      status: 'Published',
      imageUrl: 'https://images.unsplash.com/photo-1599447421405-0c3072a73194?auto=format&fit=crop&q=80&w=150&h=150'
    },
    {
      id: 'r5',
      experienceTitle: 'Free Sunrise Yoga',
      rating: 5,
      author: 'Matija',
      location: 'Jade Beach Resort',
      date: '03 Nov 2023',
      text: "This was the highlight of our trip, doing relaxing yoga every morning! Thank you Jade Beach for hosting these wonderful yoga session!",
      status: 'Published',
      imageUrl: 'https://images.unsplash.com/photo-1599447421405-0c3072a73194?auto=format&fit=crop&q=80&w=150&h=150'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-8">
      {/* Header & Controls */}
      <div className="flex flex-col gap-6 mb-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-light tracking-tight text-bored-black">Reviews</h1>
          
          <div className="flex items-center gap-2 bg-white rounded-lg p-1 border border-bored-gray-200">
             <button className="px-3 py-1.5 text-sm font-medium bg-bored-gray-100 text-bored-black rounded shadow-sm">Seller</button>
             <button className="px-3 py-1.5 text-sm font-medium text-bored-gray-500 hover:bg-bored-gray-50 rounded">Organizer</button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-bored-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search reviews..." 
              className="w-full pl-11 pr-4 py-3 bg-white border border-bored-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-bored-neon focus:border-transparent transition-all"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-3 bg-white border border-bored-gray-200 text-bored-gray-700 rounded-xl hover:bg-bored-gray-50 text-sm font-medium transition-colors">
            Filter
            <SlidersHorizontal size={16} />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-8 rounded-2xl border border-bored-gray-200">
          <h3 className="text-4xl font-light text-bored-black mb-2">654</h3>
          <p className="text-xs text-bored-gray-500 uppercase tracking-wide">Reviews collected</p>
        </div>
        <div className="bg-white p-8 rounded-2xl border border-bored-gray-200">
          <h3 className="text-3xl font-bold text-bored-gray-900 mb-1">4.78</h3>
          <p className="text-sm text-bored-gray-500">Average rating</p>
        </div>
      </div>

      {/* Reviews List */}
      <div className="bg-white border border-bored-gray-200 rounded-2xl overflow-hidden">
        {reviews.map((review, index) => (
          <div 
            key={review.id} 
            className={`p-8 flex flex-col md:flex-row gap-6 hover:bg-bored-gray-50/50 transition-colors ${index !== reviews.length - 1 ? 'border-b border-bored-gray-100' : ''}`}
          >
            {/* Left: Image & Meta */}
            <div className="flex gap-4 md:w-1/3">
              <img 
                src={review.imageUrl} 
                alt={review.experienceTitle} 
                className="w-16 h-16 rounded-xl object-cover bg-bored-gray-100 flex-shrink-0"
              />
              <div className="space-y-1">
                <h4 className="text-sm font-medium text-bored-black line-clamp-1">{review.experienceTitle}</h4>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      size={12} 
                      className={`${i < review.rating ? 'fill-bored-black text-bored-black' : 'fill-bored-gray-200 text-bored-gray-200'}`} 
                    />
                  ))}
                </div>
                <div className="text-xs text-bored-gray-500 mt-1">
                  <span>{review.location}</span> • <span>{review.author}</span> • <span>{review.date}</span>
                </div>
              </div>
            </div>

            {/* Middle: Text */}
            <div className="flex-1">
              <p className="text-sm text-bored-gray-600 leading-relaxed">{review.text ? `"${review.text}"` : ''}</p>
            </div>

            {/* Right: Status */}
            <div className="flex items-start justify-end md:w-32">
              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-bored-gray-50 text-bored-black border border-bored-gray-200">
                {review.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};