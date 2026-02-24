import React, { useState } from 'react';
import { Search, Filter, Download, ChevronRight, Calendar, Users, DollarSign, Check, X, Clock } from 'lucide-react';
import { BookingItem } from '../../types';

const mockBookings: BookingItem[] = [
  {
    id: 'BK001',
    experienceName: 'Mountain Biking Adventure',
    category: 'Hotel Activities',
    guestName: 'Sarah Johnson',
    date: '2026-02-15',
    time: '10:00',
    status: 'confirmed',
    price: 75,
    currency: '€',
    guests: 2,
    imageUrl: 'https://images.unsplash.com/photo-1544191696-102dbdaeeaa0?w=400'
  },
  {
    id: 'BK002',
    experienceName: 'Deep Tissue Massage',
    category: 'Spa & Wellness',
    guestName: 'Michael Chen',
    date: '2026-02-15',
    time: '14:00',
    status: 'confirmed',
    price: 90,
    currency: '€',
    guests: 1,
    imageUrl: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400'
  },
  {
    id: 'BK003',
    experienceName: 'Wine Tasting Experience',
    category: 'Hotel Activities',
    guestName: 'Emma Rodriguez',
    date: '2026-02-16',
    time: '18:00',
    status: 'pending',
    price: 65,
    currency: '€',
    guests: 4,
    imageUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400'
  },
  {
    id: 'BK004',
    experienceName: 'Private Yacht Excursion',
    category: 'Hotel Activities',
    guestName: 'David Park',
    date: '2026-02-17',
    time: '11:00',
    status: 'confirmed',
    price: 1200,
    currency: '€',
    guests: 6,
    imageUrl: 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=400'
  },
  {
    id: 'BK005',
    experienceName: 'Cooking Class - Local Cuisine',
    category: 'Hotel Activities',
    guestName: 'Lisa Anderson',
    date: '2026-02-17',
    time: '16:00',
    status: 'confirmed',
    price: 85,
    currency: '€',
    guests: 2,
    imageUrl: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400'
  },
  {
    id: 'BK006',
    experienceName: 'Hot Stone Therapy',
    category: 'Spa & Wellness',
    guestName: 'James Wilson',
    date: '2026-02-18',
    time: '09:00',
    status: 'pending',
    price: 120,
    currency: '€',
    guests: 1,
    imageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400'
  },
  {
    id: 'BK007',
    experienceName: 'Scenic Coastal Tour',
    category: 'Hotel Activities',
    guestName: 'Olivia Martinez',
    date: '2026-02-14',
    time: '08:00',
    status: 'completed',
    price: 450,
    currency: '€',
    guests: 3,
    imageUrl: 'https://images.unsplash.com/photo-1464037866556-6812c9d1c72e?w=400'
  },
  {
    id: 'BK008',
    experienceName: 'Yoga on the Rooftop',
    category: 'Hotel Activities',
    guestName: 'Sophie Turner',
    date: '2026-02-19',
    time: '07:00',
    status: 'confirmed',
    price: 25,
    currency: '€',
    guests: 1,
    imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400'
  },
  {
    id: 'BK009',
    experienceName: 'Paddleboard Rental',
    category: 'Rentals',
    guestName: 'Tom Harris',
    date: '2026-02-14',
    time: '13:00',
    status: 'completed',
    price: 25,
    currency: '€',
    guests: 2,
    imageUrl: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400'
  },
  {
    id: 'BK010',
    experienceName: 'Romantic Escape for Two',
    category: 'Packages',
    guestName: 'Anna & Mark Thompson',
    date: '2026-02-20',
    time: '15:00',
    status: 'confirmed',
    price: 750,
    currency: '€',
    guests: 2,
    imageUrl: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400'
  }
];

export const BookingsView: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'confirmed' | 'pending' | 'completed' | 'cancelled'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredBookings = mockBookings.filter(booking => {
    const matchesFilter = filter === 'all' || booking.status === filter;
    const matchesSearch = booking.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         booking.experienceName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusBadge = (status: BookingItem['status']) => {
    const styles = {
      confirmed: 'bg-green-100 text-green-700 border-green-200',
      pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      completed: 'bg-blue-100 text-blue-700 border-blue-200',
      cancelled: 'bg-red-100 text-red-700 border-red-200'
    };

    const icons = {
      confirmed: <Check size={12} />,
      pending: <Clock size={12} />,
      completed: <Check size={12} />,
      cancelled: <X size={12} />
    };

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border ${styles[status]}`}>
        {icons[status]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const stats = {
    total: mockBookings.length,
    confirmed: mockBookings.filter(b => b.status === 'confirmed').length,
    pending: mockBookings.filter(b => b.status === 'pending').length,
    completed: mockBookings.filter(b => b.status === 'completed').length
  };

  return (
    <div className="max-w-7xl mx-auto px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-light tracking-tight text-bored-black mb-2">Bookings</h1>
        <p className="text-sm text-bored-gray-500">Manage and track all experience reservations</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl border border-bored-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-3xl font-light text-bored-black">{stats.total}</p>
              <p className="text-xs text-bored-gray-500 mt-1 uppercase tracking-wide">Total Bookings</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-bored-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Check size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-3xl font-light text-bored-black">{stats.confirmed}</p>
              <p className="text-xs text-bored-gray-500 mt-1 uppercase tracking-wide">Confirmed</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-bored-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock size={20} className="text-yellow-600" />
            </div>
            <div>
              <p className="text-3xl font-light text-bored-black">{stats.pending}</p>
              <p className="text-xs text-bored-gray-500 mt-1 uppercase tracking-wide">Pending</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-bored-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Check size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-3xl font-light text-bored-black">{stats.completed}</p>
              <p className="text-xs text-bored-gray-500 mt-1 uppercase tracking-wide">Completed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-2xl border border-bored-gray-200 p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex gap-2 flex-wrap">
            {(['all', 'confirmed', 'pending', 'completed', 'cancelled'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  filter === status
                    ? 'bg-bored-black text-white'
                    : 'bg-bored-gray-100 text-bored-gray-700 hover:bg-bored-gray-200'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-bored-gray-400" />
              <input
                type="text"
                placeholder="Search bookings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 text-sm border border-bored-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-bored-neon transition-all"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-bored-gray-700 bg-white border border-bored-gray-200 rounded-xl hover:bg-bored-gray-50 transition-colors">
              <Download size={16} />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Bookings List */}
      <div className="bg-white rounded-2xl border border-bored-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-bored-gray-50 border-b border-bored-gray-100">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-semibold text-bored-gray-500 uppercase tracking-wider">Booking ID</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-bored-gray-500 uppercase tracking-wider">Experience</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-bored-gray-500 uppercase tracking-wider">Category</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-bored-gray-500 uppercase tracking-wider">Guest</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-bored-gray-500 uppercase tracking-wider">Date & Time</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-bored-gray-500 uppercase tracking-wider">Guests</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-bored-gray-500 uppercase tracking-wider">Amount</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-bored-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-bored-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bored-gray-100">
              {filteredBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-bored-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-sm font-mono font-semibold text-bored-gray-900">{booking.id}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={booking.imageUrl}
                        alt={booking.experienceName}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                      <span className="text-sm font-medium text-bored-gray-900">{booking.experienceName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs px-2 py-1 rounded-full bg-bored-gray-100 text-bored-gray-700 font-medium">{booking.category}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-bored-gray-900">{booking.guestName}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <p className="font-medium text-bored-gray-900">{new Date(booking.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                      <p className="text-bored-gray-500">{booking.time}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-sm text-bored-gray-900">
                      <Users size={14} className="text-bored-gray-400" />
                      {booking.guests}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-bored-gray-900">
                      {booking.currency}{booking.price}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(booking.status)}
                  </td>
                  <td className="px-6 py-4">
                    <button className="p-2 hover:bg-bored-gray-100 rounded-lg transition-colors">
                      <ChevronRight size={16} className="text-bored-gray-400" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
