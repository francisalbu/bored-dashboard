import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';

interface CalendarBooking {
  id: string;
  experience: string;
  experienceImage: string;
  totalBookings: number;
  status: 'Accepted' | 'Pending';
  guests: string; // e.g., "ID 1", "2/15", "ID 6"
  startTime: string;
  endTime: string;
  date: string;
}

interface Experience {
  id: string;
  name: string;
  type: string;
  image: string;
  bookingsCount: number;
}

// Mock data
const mockExperiences: Experience[] = [
  {
    id: 'exp-1',
    name: 'Ancient Market Square',
    type: 'Amphitheater Walk',
    image: 'https://images.unsplash.com/photo-1533929736458-ca588d08c8be?w=200&q=80',
    bookingsCount: 1
  },
  {
    id: 'exp-2',
    name: 'Archery Challenge',
    type: 'Family or Friends',
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=200&q=80',
    bookingsCount: 1
  },
  {
    id: 'exp-3',
    name: 'Beach Volleyball Session',
    type: 'Group Session',
    image: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=200&q=80',
    bookingsCount: 2
  }
];

const mockBookings: CalendarBooking[] = [
  // Ancient Market Square
  {
    id: 'b-1',
    experience: 'Ancient Market Square',
    experienceImage: 'https://images.unsplash.com/photo-1533929736458-ca588d08c8be?w=200&q=80',
    totalBookings: 1,
    status: 'Accepted',
    guests: 'ID 1',
    startTime: '11:30',
    endTime: '13:30',
    date: '2025-07-01'
  },
  // Archery Challenge
  {
    id: 'b-2',
    experience: 'Archery Challenge',
    experienceImage: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=200&q=80',
    totalBookings: 1,
    status: 'Pending',
    guests: 'ID 1',
    startTime: '13:00',
    endTime: '17:30',
    date: '2025-07-01'
  },
  // Beach Volleyball - multiple bookings
  {
    id: 'b-3',
    experience: 'Beach Volleyball Session',
    experienceImage: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=200&q=80',
    totalBookings: 2,
    status: 'Accepted',
    guests: 'ID 1',
    startTime: '08:30',
    endTime: '10:30',
    date: '2025-07-01'
  },
  {
    id: 'b-4',
    experience: 'Beach Volleyball Session',
    experienceImage: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=200&q=80',
    totalBookings: 2,
    status: 'Pending',
    guests: '2/15',
    startTime: '10:00',
    endTime: '11:30',
    date: '2025-07-01'
  },
  {
    id: 'b-5',
    experience: 'Beach Volleyball Session',
    experienceImage: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=200&q=80',
    totalBookings: 2,
    status: 'Accepted',
    guests: 'ID 6',
    startTime: '13:00',
    endTime: '14:00',
    date: '2025-07-01'
  },
  {
    id: 'b-6',
    experience: 'Beach Volleyball Session',
    experienceImage: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=200&q-80',
    totalBookings: 2,
    status: 'Accepted',
    guests: 'ID 1',
    startTime: '08:30',
    endTime: '13:00',
    date: '2025-07-01'
  }
];

const timeSlots = [
  '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'
];

export const CalendarView: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date('2025-07-01'));
  const [selectedExperience, setSelectedExperience] = useState<string>('all');
  const [selectedRate, setSelectedRate] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');

  // Calculate booking position and width based on time
  const getBookingStyle = (startTime: string, endTime: string) => {
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    const baseMinutes = 8 * 60; // 08:00 start
    
    const left = ((startMinutes - baseMinutes) / 60) * 100; // Each hour = 100px width
    const width = ((endMinutes - startMinutes) / 60) * 100;
    
    return {
      left: `${left}px`,
      width: `${width}px`
    };
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="max-w-[1400px] mx-auto px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-light tracking-tight text-bored-black mb-2">Calendar</h1>
        <p className="text-sm text-bored-gray-500">View and manage all your experience bookings</p>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl border border-bored-gray-200 p-6 mb-8">
        <div className="flex items-center justify-between">
          {/* Left side filters */}
          <div className="flex items-center gap-4">
            {/* Date selector */}
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setSelectedDate(new Date(selectedDate.getTime() - 86400000))}
                className="p-1 hover:bg-bored-gray-100 rounded"
              >
                <ChevronLeft size={16} />
              </button>
              <div className="px-3 py-1.5 bg-bored-gray-50 rounded-lg text-sm font-medium">
                Today
              </div>
              <button 
                onClick={() => setSelectedDate(new Date(selectedDate.getTime() + 86400000))}
                className="p-1 hover:bg-bored-gray-100 rounded"
              >
                <ChevronRight size={16} />
              </button>
              <span className="text-sm text-bored-gray-600 ml-2">{formatDate(selectedDate)}</span>
            </div>

            {/* Experience filter */}
            <div className="flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-bored-gray-500">
                <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <select 
                value={selectedExperience}
                onChange={(e) => setSelectedExperience(e.target.value)}
                className="text-sm border-none focus:outline-none focus:ring-0 text-bored-gray-700 font-medium"
              >
                <option value="all">Experience</option>
                {mockExperiences.map(exp => (
                  <option key={exp.id} value={exp.id}>{exp.name}</option>
                ))}
              </select>
            </div>

            {/* Rates filter */}
            <div className="flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-bored-gray-500">
                <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
              <select 
                value={selectedRate}
                onChange={(e) => setSelectedRate(e.target.value)}
                className="text-sm border-none focus:outline-none focus:ring-0 text-bored-gray-700 font-medium"
              >
                <option value="all">Rates: All</option>
                <option value="standard">Standard</option>
                <option value="premium">Premium</option>
              </select>
            </div>
          </div>

          {/* Right side - Sort & Search */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-bored-gray-500">Sort by:</span>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-sm border-none focus:outline-none focus:ring-0 text-bored-gray-700 font-medium"
              >
                <option value="name">Name (A-Z)</option>
                <option value="bookings">Most Bookings</option>
                <option value="time">Start Time</option>
              </select>
            </div>
            <button className="p-2 hover:bg-bored-gray-100 rounded-lg">
              <Search size={16} className="text-bored-gray-500" />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-lg border border-bored-gray-200 overflow-hidden">
        <div className="flex">
          {/* Left sidebar - Experiences */}
          <div className="w-64 border-r border-bored-gray-200 flex-shrink-0">
            {/* Header */}
            <div className="px-4 py-3 border-b border-bored-gray-200 bg-bored-gray-50">
              <span className="text-xs font-semibold text-bored-gray-500 uppercase">Experience</span>
            </div>

            {/* Experience List */}
            <div>
              {mockExperiences.map((exp) => (
                <div 
                  key={exp.id}
                  className="px-4 py-4 border-b border-bored-gray-200 hover:bg-bored-gray-50 cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <img 
                      src={exp.image} 
                      alt={exp.name}
                      className="w-10 h-10 rounded object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-bored-gray-900 truncate">{exp.name}</h3>
                      <p className="text-xs text-bored-gray-500 truncate">{exp.type}</p>
                      <p className="text-xs text-bored-gray-400 mt-1">
                        <span className="inline-flex items-center gap-1">
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M6 3v3l2 1" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
                            <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1"/>
                          </svg>
                          {exp.bookingsCount} booking{exp.bookingsCount !== 1 ? 's' : ''}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right side - Timeline */}
          <div className="flex-1 overflow-x-auto">
            {/* Time headers */}
            <div className="flex border-b border-bored-gray-200 bg-bored-gray-50">
              {timeSlots.map((time) => (
                <div 
                  key={time}
                  className="flex-shrink-0 px-4 py-3 text-center"
                  style={{ width: '100px' }}
                >
                  <span className="text-xs font-medium text-bored-gray-600">{time}</span>
                </div>
              ))}
            </div>

            {/* Timeline rows */}
            <div className="relative">
              {mockExperiences.map((exp, index) => (
                <div 
                  key={exp.id}
                  className="relative border-b border-bored-gray-200 hover:bg-bored-gray-50"
                  style={{ height: '88px' }}
                >
                  {/* Time grid lines */}
                  <div className="absolute inset-0 flex">
                    {timeSlots.map((time) => (
                      <div 
                        key={time}
                        className="border-r border-bored-gray-100"
                        style={{ width: '100px' }}
                      />
                    ))}
                  </div>

                  {/* Bookings for this experience */}
                  <div className="absolute inset-0 px-2 py-2">
                    {mockBookings
                      .filter(booking => booking.experience === exp.name)
                      .map((booking) => {
                        const style = getBookingStyle(booking.startTime, booking.endTime);
                        return (
                          <div
                            key={booking.id}
                            className={`absolute rounded-lg p-2 cursor-pointer hover:shadow-md transition-shadow ${
                              booking.status === 'Accepted' 
                                ? 'bg-green-100 border border-green-300' 
                                : 'bg-blue-100 border border-blue-300'
                            }`}
                            style={{
                              ...style,
                              top: '8px',
                              height: 'calc(100% - 16px)',
                              minHeight: '64px'
                            }}
                          >
                            <div className="flex items-center gap-1 mb-1">
                              <span className={`inline-block w-2 h-2 rounded-full ${
                                booking.status === 'Accepted' ? 'bg-green-500' : 'bg-blue-500'
                              }`} />
                              <span className="text-xs font-semibold text-bored-gray-900">
                                {booking.status}
                              </span>
                            </div>
                            <p className="text-xs font-medium text-bored-gray-700">{booking.guests}</p>
                            <p className="text-xs text-bored-gray-500 mt-1">
                              {booking.startTime} - {booking.endTime}
                            </p>
                          </div>
                        );
                      })}
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
