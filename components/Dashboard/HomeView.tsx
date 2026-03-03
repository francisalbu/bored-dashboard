import React from 'react';
import { ChevronDown, Star } from 'lucide-react';
import { Booking, Review } from '../../types';

interface HomeViewProps {
  hotelId: string | null;
}

export const HomeView: React.FC<HomeViewProps> = ({ hotelId: _hotelId }) => {
  // Mock Data for Bookings
  const recentBookings: Booking[] = [
    {
      id: 'b1',
      experienceName: 'Private Yacht Excursion with Dolphin Spotting & Chef\'s Tasting Menu',
      date: '26 Jun 2025',
      time: '14:00',
      price: 1200.00,
      currency: '€'
    },
    {
      id: 'b2',
      experienceName: 'Scenic Coastal Tour',
      date: '26 Jun 2025',
      time: '0:11',
      price: 75.00,
      currency: '€'
    },
    {
      id: 'b3',
      experienceName: 'Helicopter Tour with Private Vineyard & Wine Cellar Tour',
      date: '19 Jun 2025',
      time: '10:00',
      price: 2650.00,
      currency: '€'
    }
  ];

  // Mock Data for Home Reviews (Subset)
  const homeReviews: Review[] = [
    {
      id: 'r10',
      experienceTitle: 'Pampering Facial',
      rating: 5,
      author: 'Jules',
      date: '09 Apr 2025',
      location: 'Jade Hotels',
      text: '',
      status: 'Published',
      imageUrl: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&q=80&w=150&h=150'
    },
    {
      id: 'r1',
      experienceTitle: 'VIP Dinner @ Jade Beach',
      rating: 5,
      author: 'Matija',
      date: '30 Jan 2025',
      location: 'Jade Hotels',
      text: "Great!",
      status: 'Published',
      imageUrl: 'https://images.unsplash.com/photo-1544148103-0773bf10d330?auto=format&fit=crop&q=80&w=150&h=150'
    },
    {
      id: 'r11',
      experienceTitle: 'Sunrise Hot Air Balloon Flight Over...',
      rating: 5,
      author: 'Thomas',
      date: '27 Jan 2025',
      location: 'Camp Nomad',
      text: '',
      status: 'Published',
      imageUrl: 'https://images.unsplash.com/photo-1540962351504-03099e0a754b?auto=format&fit=crop&q=80&w=150&h=150'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-8 space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-light tracking-tight text-bored-black mb-2">Home</h1>
        <p className="text-sm text-bored-gray-500">Your dashboard overview</p>
      </div>

      {/* Top Section: Bookings & Earnings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Recent Bookings (Takes up 2/3) */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-bored-black">Recent Bookings</h2>
            <button className="text-sm font-medium text-bored-gray-500 hover:text-bored-black transition-colors">See all</button>
          </div>

          <div className="bg-white border border-bored-gray-200 rounded-2xl overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-bored-gray-100 bg-bored-gray-50 text-xs font-semibold text-bored-gray-500 uppercase tracking-wider">
              <div className="col-span-6">Experience name</div>
              <div className="col-span-3">Experience date</div>
              <div className="col-span-3 text-right">Price</div>
            </div>

            {/* Table Body */}
            <div>
              {recentBookings.map((booking) => (
                <div key={booking.id} className="grid grid-cols-12 gap-4 px-6 py-5 border-b border-bored-gray-100 last:border-0 hover:bg-bored-gray-50/50 transition-colors items-center cursor-pointer">
                  <div className="col-span-6 pr-4">
                    <span className="text-sm font-medium text-bored-gray-900 line-clamp-2 leading-snug">
                      {booking.experienceName}
                    </span>
                  </div>
                  <div className="col-span-3">
                    <div className="flex flex-col">
                      <span className="text-sm text-bored-gray-900">{booking.date}</span>
                      <span className="text-xs text-bored-gray-400">{booking.time}</span>
                    </div>
                  </div>
                  <div className="col-span-3 text-right">
                    <span className="text-sm font-medium text-bored-gray-900">
                      {booking.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {booking.currency}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Earnings Chart (Takes up 1/3) */}
        <div className="lg:col-span-1 flex flex-col h-full">
           <div className="flex items-center justify-between mb-4 opacity-0"> {/* Hidden header for alignment */}
            <h2 className="text-lg font-bold">Earnings</h2>
          </div>
          
          <div className="bg-white border border-bored-gray-200 rounded-2xl p-8 flex-1 flex flex-col justify-between relative overflow-hidden">
            <div className="flex justify-between items-start z-10">
              <div>
                <p className="text-3xl font-light text-bored-black">15,760.00 EUR</p>
                <p className="text-xs text-bored-gray-400 mt-2 uppercase tracking-wide">Total value of bookings</p>
              </div>
              <button className="flex items-center gap-1 text-xs font-medium text-bored-gray-500 hover:text-bored-black bg-bored-gray-50 px-3 py-1.5 rounded-lg transition-colors">
                Last 4 weeks <ChevronDown size={12} />
              </button>
            </div>

            {/* Decorative Chart Graphic */}
            <div className="absolute bottom-0 left-0 right-0 h-48 w-full z-0 pointer-events-none">
               <svg viewBox="0 0 400 200" className="w-full h-full" preserveAspectRatio="none">
                 <defs>
                   <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="0%" stopColor="#9CA3AF" stopOpacity="0.2"/>
                     <stop offset="100%" stopColor="#9CA3AF" stopOpacity="0"/>
                   </linearGradient>
                 </defs>
                 {/* Curve */}
                 <path 
                   d="M0,180 C50,180 80,60 150,60 S 250,160 400,170" 
                   fill="none" 
                   stroke="#6B7280" 
                   strokeWidth="3"
                   vectorEffect="non-scaling-stroke"
                 />
                 {/* Fill Area */}
                 <path 
                   d="M0,180 C50,180 80,60 150,60 S 250,160 400,170 V 200 H 0 Z" 
                   fill="url(#chartGradient)" 
                 />
               </svg>
               {/* Date Labels approximation */}
               <div className="absolute bottom-2 w-full flex justify-between px-4 text-[10px] text-bored-gray-400">
                  <span>26/05</span>
                  <span>02/06</span>
                  <span>09/06</span>
                  <span>16/06</span>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Guest Reviews */}
      <div>
        <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-bored-black">Guest Reviews</h2>
            <button className="text-sm font-medium text-bored-gray-500 hover:text-bored-black transition-colors">See all</button>
        </div>

        <div className="bg-white border border-bored-gray-200 rounded-2xl p-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* Stats Column */}
            <div className="lg:col-span-1 space-y-8 pr-4 lg:border-r border-bored-gray-100">
               <div>
                 <p className="text-4xl font-light text-bored-black">53</p>
                 <p className="text-xs text-bored-gray-500 mt-2 uppercase tracking-wide">Reviews collected</p>
               </div>
               <div>
                 <p className="text-4xl font-light text-bored-black">5</p>
                 <p className="text-xs text-bored-gray-500 mt-2 uppercase tracking-wide">Average rating</p>
               </div>
            </div>

            {/* Review List Column */}
            <div className="lg:col-span-3 flex flex-col divide-y divide-bored-gray-100">
              {homeReviews.map((review) => (
                <div key={review.id} className="py-4 first:pt-0 last:pb-0 flex items-start gap-4">
                   <img 
                    src={review.imageUrl} 
                    alt={review.experienceTitle} 
                    className="w-12 h-12 rounded-lg object-cover bg-bored-gray-100 flex-shrink-0"
                   />
                   <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                         <div>
                            <h4 className="text-sm font-semibold text-bored-gray-900">{review.experienceTitle}</h4>
                            <div className="flex items-center gap-1 my-1">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i} 
                                  size={10} 
                                  className={`${i < review.rating ? 'fill-bored-black text-bored-black' : 'fill-bored-gray-200 text-bored-gray-200'}`} 
                                />
                              ))}
                            </div>
                            <p className="text-xs text-bored-gray-400">
                               {review.location} • {review.author} • {review.date}
                            </p>
                         </div>
                         {review.text && (
                           <div className="max-w-xs text-right hidden sm:block">
                              <p className="text-sm italic text-bored-gray-600 truncate">"{review.text}"</p>
                           </div>
                         )}
                      </div>
                   </div>
                   <div className="flex-shrink-0">
                      <button className="text-bored-gray-300 hover:text-bored-black">
                         <span className="sr-only">Menu</span>
                         <span className="text-xl leading-none">−</span> 
                         {/* Using a minus sign/dash to mimic the 'remove' or 'minimize' icon seen in screenshot, or can use a Menu icon */}
                      </button>
                   </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};