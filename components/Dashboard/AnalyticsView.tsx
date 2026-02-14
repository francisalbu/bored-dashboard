import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Calendar, Users, Package } from 'lucide-react';
import { AnalyticsMetric, ChartDataPoint } from '../../types';

const mockMetrics: AnalyticsMetric[] = [
  { label: 'Total Revenue', value: '€24,580', change: 12.5, trend: 'up' },
  { label: 'Bookings', value: '342', change: 8.2, trend: 'up' },
  { label: 'Average Booking Value', value: '€72', change: -3.1, trend: 'down' },
  { label: 'Active Experiences', value: '18', change: 5.8, trend: 'up' }
];

const revenueData: ChartDataPoint[] = [
  { label: 'Jan', value: 18500 },
  { label: 'Feb', value: 20200 },
  { label: 'Mar', value: 22100 },
  { label: 'Apr', value: 19800 },
  { label: 'May', value: 24500 },
  { label: 'Jun', value: 26800 },
  { label: 'Jul', value: 31200 }
];

const topExperiences = [
  { name: 'Mountain Biking Adventure', bookings: 45, revenue: 3375, imageUrl: 'https://images.unsplash.com/photo-1544191696-102dbdaeeaa0?w=400' },
  { name: 'Deep Tissue Massage', bookings: 38, revenue: 3420, imageUrl: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400' },
  { name: 'Private Yacht Excursion', bookings: 12, revenue: 14400, imageUrl: 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=400' },
  { name: 'Wine Tasting Experience', bookings: 32, revenue: 2080, imageUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400' },
  { name: 'Cooking Class', bookings: 28, revenue: 2380, imageUrl: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400' }
];

export const AnalyticsView: React.FC = () => {
  const maxRevenue = Math.max(...revenueData.map(d => d.value));

  return (
    <div className="max-w-7xl mx-auto px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-light tracking-tight text-bored-black mb-2">Analytics</h1>
        <p className="text-sm text-bored-gray-500">Track your performance and revenue metrics</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {mockMetrics.map((metric, index) => (
          <div key={index} className="bg-white rounded-2xl border border-bored-gray-200 p-6">
            <div className="flex items-start justify-between mb-6">
              <div className={`p-2 rounded-lg ${
                index === 0 ? 'bg-green-100' : 
                index === 1 ? 'bg-blue-100' : 
                index === 2 ? 'bg-purple-100' : 
                'bg-orange-100'
              }`}>
                {index === 0 && <DollarSign size={20} className="text-green-600" />}
                {index === 1 && <Calendar size={20} className="text-blue-600" />}
                {index === 2 && <DollarSign size={20} className="text-purple-600" />}
                {index === 3 && <Package size={20} className="text-orange-600" />}
              </div>
              {metric.change && (
                <div className={`flex items-center gap-1 text-sm font-semibold ${
                  metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {metric.trend === 'up' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                  {Math.abs(metric.change)}%
                </div>
              )}
            </div>
            <h3 className="text-3xl font-light text-bored-black mb-1">{metric.value}</h3>
            <p className="text-xs text-bored-gray-500 uppercase tracking-wide">{metric.label}</p>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Chart */}
        <div className="bg-white rounded-2xl border border-bored-gray-200 p-8">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-bored-black mb-1">Revenue Overview</h2>
            <p className="text-xs text-bored-gray-500">Monthly revenue for 2026</p>
          </div>
          <div className="h-64 flex items-end justify-between gap-2">
            {revenueData.map((data, index) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full relative group">
                  <div 
                    className="w-full bg-bored-neon hover:bg-bored-neon/80 rounded-t transition-all cursor-pointer"
                    style={{ height: `${(data.value / maxRevenue) * 200}px` }}
                  >
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-bored-black text-white px-2 py-1 rounded text-xs whitespace-nowrap transition-opacity">
                      €{data.value.toLocaleString()}
                    </div>
                  </div>
                </div>
                <span className="text-xs text-bored-gray-500 font-medium">{data.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Booking Distribution */}
        <div className="bg-white rounded-2xl border border-bored-gray-200 p-8">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-bored-gray-900 mb-1">Booking Distribution</h2>
            <p className="text-sm text-bored-gray-500">By experience category</p>
          </div>
          <div className="space-y-4">
            {[
              { label: 'Hotel Activities', value: 42, color: 'bg-blue-500' },
              { label: 'Spa & Wellness', value: 28, color: 'bg-purple-500' },
              { label: 'Transfers', value: 15, color: 'bg-green-500' },
              { label: 'Rentals', value: 10, color: 'bg-orange-500' },
              { label: 'Dining', value: 5, color: 'bg-red-500' }
            ].map((item, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-bored-gray-700">{item.label}</span>
                  <span className="text-sm font-bold text-bored-gray-900">{item.value}%</span>
                </div>
                <div className="h-2 bg-bored-gray-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${item.color} transition-all duration-500`}
                    style={{ width: `${item.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Experiences */}
      <div className="bg-white rounded-2xl border border-bored-gray-200 p-8">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-bored-black mb-1">Top Performing Experiences</h2>
          <p className="text-xs text-bored-gray-500">Your most popular offerings this month</p>
        </div>
        <div className="space-y-4">
          {topExperiences.map((exp, index) => (
            <div key={index} className="flex items-center gap-4 p-4 rounded-xl hover:bg-bored-gray-50 transition-colors cursor-pointer">
              <div className="flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden bg-bored-gray-100">
                <img src={exp.imageUrl} alt={exp.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-bored-black truncate">{exp.name}</h3>
                <p className="text-xs text-bored-gray-500 mt-1">{exp.bookings} bookings</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-bored-black">€{exp.revenue.toLocaleString()}</p>
                <p className="text-xs text-bored-gray-500 mt-1">revenue</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
