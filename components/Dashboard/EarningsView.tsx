import React, { useState } from 'react';
import { TrendingUp, DollarSign, Calendar, Download, ChevronDown } from 'lucide-react';
import { EarningsData } from '../../types';

const mockEarningsData: EarningsData[] = [
  { period: 'January 2026', revenue: 18500, bookings: 245, averageValue: 75.51 },
  { period: 'February 2026', revenue: 20200, bookings: 268, averageValue: 75.37 },
  { period: 'March 2026', revenue: 22100, bookings: 289, averageValue: 76.47 },
  { period: 'April 2026', revenue: 19800, bookings: 261, averageValue: 75.86 },
  { period: 'May 2026', revenue: 24500, bookings: 312, averageValue: 78.53 },
  { period: 'June 2026', revenue: 26800, bookings: 338, averageValue: 79.29 },
  { period: 'July 2026', revenue: 31200, bookings: 385, averageValue: 81.04 }
];

const payoutHistory = [
  { id: 'PAY001', date: '2026-02-01', amount: 18500, status: 'completed', method: 'Bank Transfer' },
  { id: 'PAY002', date: '2026-01-01', amount: 17200, status: 'completed', method: 'Bank Transfer' },
  { id: 'PAY003', date: '2025-12-01', amount: 21300, status: 'completed', method: 'Bank Transfer' },
  { id: 'PAY004', date: '2025-11-01', amount: 19800, status: 'completed', method: 'Bank Transfer' }
];

const revenueByCategory = [
  { category: 'Hotel Activities', amount: 15450, percentage: 47, color: 'bg-blue-500' },
  { category: 'Spa & Wellness', amount: 9850, percentage: 30, color: 'bg-purple-500' },
  { category: 'Rentals', amount: 4250, percentage: 13, color: 'bg-orange-500' },
  { category: 'Packages', amount: 3150, percentage: 10, color: 'bg-red-500' }
];

export const EarningsView: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('This Month');
  const currentMonthData = mockEarningsData[mockEarningsData.length - 1];
  const previousMonthData = mockEarningsData[mockEarningsData.length - 2];
  const revenueGrowth = ((currentMonthData.revenue - previousMonthData.revenue) / previousMonthData.revenue * 100).toFixed(1);

  const totalRevenue = mockEarningsData.reduce((sum, data) => sum + data.revenue, 0);
  const totalBookings = mockEarningsData.reduce((sum, data) => sum + data.bookings, 0);

  return (
    <div className="max-w-7xl mx-auto px-8">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-light tracking-tight text-bored-black mb-2">Earnings</h1>
          <p className="text-sm text-bored-gray-500">Track your revenue and payouts</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-bored-gray-700 bg-white border border-bored-gray-200 rounded-lg hover:bg-bored-gray-50 transition-colors">
            {selectedPeriod}
            <ChevronDown size={16} />
          </button>
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-bored-black rounded-lg hover:bg-bored-gray-800 transition-colors">
            <Download size={16} />
            Download Report
          </button>
        </div>
      </div>

      {/* Main Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-8 text-white">
          <div className="flex items-start justify-between mb-6">
            <div className="p-2 bg-white/20 rounded-lg">
              <DollarSign size={24} />
            </div>
            <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-full text-xs font-semibold">
              <TrendingUp size={12} />
              {revenueGrowth}%
            </div>
          </div>
          <h2 className="text-4xl font-light mb-2">€{currentMonthData.revenue.toLocaleString()}</h2>
          <p className="text-green-100 text-xs uppercase tracking-wide">Current Month Revenue</p>
        </div>

        <div className="bg-white rounded-2xl border border-bored-gray-200 p-8">
          <div className="flex items-start justify-between mb-6">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar size={24} className="text-blue-600" />
            </div>
          </div>
          <h2 className="text-4xl font-light text-bored-black mb-2">{currentMonthData.bookings}</h2>
          <p className="text-bored-gray-500 text-xs uppercase tracking-wide">Bookings This Month</p>
        </div>

        <div className="bg-white rounded-2xl border border-bored-gray-200 p-8">
          <div className="flex items-start justify-between mb-6">
            <div className="p-2 bg-purple-100 rounded-lg">
              <DollarSign size={24} className="text-purple-600" />
            </div>
          </div>
          <h2 className="text-4xl font-light text-bored-black mb-2">€{currentMonthData.averageValue.toFixed(2)}</h2>
          <p className="text-bored-gray-500 text-xs uppercase tracking-wide">Average Booking Value</p>
        </div>
      </div>

      {/* Revenue Chart and Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Monthly Revenue Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-bored-gray-200 p-8">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-bored-black mb-1">Revenue Trend</h2>
            <p className="text-xs text-bored-gray-500">Monthly revenue over time</p>
          </div>
          <div className="h-64 flex items-end justify-between gap-3">
            {mockEarningsData.map((data, index) => {
              const maxRevenue = Math.max(...mockEarningsData.map(d => d.revenue));
              const height = (data.revenue / maxRevenue) * 100;
              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full relative group">
                    <div 
                      className="w-full bg-gradient-to-t from-green-500 to-green-400 hover:from-green-600 hover:to-green-500 rounded-t transition-all cursor-pointer"
                      style={{ height: `${height * 2}px` }}
                    >
                      <div className="opacity-0 group-hover:opacity-100 absolute -top-16 left-1/2 -translate-x-1/2 bg-bored-black text-white px-3 py-2 rounded text-xs whitespace-nowrap transition-opacity z-10">
                        <p className="font-bold">€{data.revenue.toLocaleString()}</p>
                        <p className="text-bored-gray-300">{data.bookings} bookings</p>
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-bored-gray-500 font-medium text-center">
                    {data.period.split(' ')[0].slice(0, 3)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Revenue by Category */}
        <div className="bg-white rounded-lg border border-bored-gray-200 p-6">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-bored-gray-900 mb-1">Revenue Sources</h2>
            <p className="text-sm text-bored-gray-500">By category</p>
          </div>
          <div className="space-y-4">
            {revenueByCategory.map((item, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-bored-gray-700">{item.category}</span>
                  <span className="text-sm font-bold text-bored-gray-900">€{item.amount.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-bored-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${item.color} transition-all duration-500`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-bored-gray-500 w-8">{item.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Payout History */}
      <div className="bg-white rounded-lg border border-bored-gray-200 overflow-hidden">
        <div className="p-6 border-b border-bored-gray-200">
          <h2 className="text-lg font-bold text-bored-gray-900 mb-1">Payout History</h2>
          <p className="text-sm text-bored-gray-500">Your recent payment transfers</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-bored-gray-50">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-bored-gray-600 uppercase">Payout ID</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-bored-gray-600 uppercase">Date</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-bored-gray-600 uppercase">Amount</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-bored-gray-600 uppercase">Method</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-bored-gray-600 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bored-gray-200">
              {payoutHistory.map((payout) => (
                <tr key={payout.id} className="hover:bg-bored-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-sm font-mono font-semibold text-bored-gray-900">{payout.id}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-bored-gray-900">
                      {new Date(payout.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-bored-gray-900">€{payout.amount.toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-bored-gray-700">{payout.method}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                      {payout.status.charAt(0).toUpperCase() + payout.status.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="bg-white rounded-lg border border-bored-gray-200 p-6">
          <p className="text-sm text-bored-gray-500 mb-2">Total Revenue (All Time)</p>
          <p className="text-3xl font-bold text-bored-gray-900">€{totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-lg border border-bored-gray-200 p-6">
          <p className="text-sm text-bored-gray-500 mb-2">Total Bookings</p>
          <p className="text-3xl font-bold text-bored-gray-900">{totalBookings.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-lg border border-bored-gray-200 p-6">
          <p className="text-sm text-bored-gray-500 mb-2">Pending Payout</p>
          <p className="text-3xl font-bold text-green-600">€{currentMonthData.revenue.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
};
