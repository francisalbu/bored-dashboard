import React, { useState } from 'react';
import { Search, Plus, Star, TrendingUp, Calendar, DollarSign, Sparkles, User, Globe, Users, BarChart3, ArrowUpRight, Filter } from 'lucide-react';

interface Guest {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  interests: string[];
  totalSpend: number;
  satisfaction: number;
  bookingsCount: number;
  lastVisit: string;
  tags: ('Top Guest' | 'Repeat Guest' | 'VIP' | 'New')[];
  notes?: string;
  gatheringData?: boolean;
  nationality?: string;
  age?: number;
  status?: 'Active' | 'Inactive' | 'VIP';
  summary?: string;
  familySize?: number;
}

// Guest data generator
const firstNames = ['Arturo', 'Katherine', 'Jaydon', 'Shauna', 'Wilfred', 'Wanda', 'Audrey', 'Lamar', 'Tabitha', 'Dwight', 'Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'Ethan', 'Sophia', 'Mason', 'Isabella', 'William', 'Mia', 'James', 'Charlotte', 'Benjamin', 'Amelia', 'Lucas', 'Harper', 'Henry', 'Evelyn', 'Alexander', 'Abigail', 'Sebastian', 'Emily', 'Jack', 'Elizabeth', 'Owen', 'Sofia', 'Theodore', 'Avery', 'Aiden', 'Ella', 'Jackson', 'Scarlett', 'Samuel', 'Grace', 'David', 'Chloe', 'Joseph', 'Victoria', 'Carter', 'Riley', 'Wyatt', 'Aria', 'John', 'Lily', 'Dylan', 'Aubrey', 'Luke', 'Zoey', 'Gabriel', 'Penelope', 'Anthony', 'Lillian', 'Isaac', 'Addison', 'Grayson', 'Layla', 'Julian', 'Natalie', 'Levi', 'Camila', 'Christopher', 'Hannah', 'Joshua', 'Brooklyn', 'Andrew', 'Zoe', 'Lincoln', 'Nora', 'Mateo', 'Leah', 'Ryan', 'Savannah', 'Jaxon', 'Audrey', 'Nathan', 'Claire', 'Aaron', 'Eleanor', 'Isaiah', 'Skylar', 'Thomas', 'Ellie', 'Charles', 'Samantha', 'Caleb', 'Stella', 'Josiah', 'Paisley', 'Christian', 'Violet', 'Hunter', 'Mila', 'Eli', 'Allison', 'Jonathan', 'Alexa', 'Connor', 'Anna'];

const lastNames = ['Madsen', 'Roundabelle', 'Koepp', 'Tramp', 'Lynch', 'Lehner', 'Watsica', 'Gutmann', 'Bartoletti', 'Marks', 'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores', 'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts', 'Gomez', 'Phillips', 'Evans', 'Turner', 'Diaz', 'Parker', 'Cruz', 'Edwards', 'Collins', 'Reyes', 'Stewart', 'Morris', 'Morales', 'Murphy', 'Cook', 'Rogers', 'Gutierrez', 'Ortiz', 'Morgan', 'Cooper', 'Peterson', 'Bailey', 'Reed', 'Kelly', 'Howard', 'Ramos', 'Kim', 'Cox', 'Ward', 'Richardson', 'Watson', 'Brooks', 'Chavez', 'Wood', 'James', 'Bennett', 'Gray', 'Mendoza', 'Ruiz', 'Hughes', 'Price', 'Alvarez', 'Castillo', 'Sanders', 'Patel', 'Myers', 'Long', 'Ross', 'Foster', 'Jimenez'];

const nationalities = ['USA', 'UK', 'Germany', 'France', 'Spain', 'Italy', 'Canada', 'Australia', 'Netherlands', 'Belgium', 'Switzerland', 'Austria', 'Sweden', 'Norway', 'Denmark', 'Portugal', 'Ireland', 'Japan', 'South Korea', 'Singapore', 'Brazil', 'Mexico', 'Argentina', 'Chile'];

const interests = ['Stationery', 'Culture', 'Relaxation', 'Adventure', 'Wellness', 'Gastronomy', 'Wine Tasting', 'Art', 'History', 'Nature', 'Photography', 'Music', 'Fitness', 'Spa', 'Shopping', 'Nightlife', 'Family Activities', 'Water Sports', 'Hiking', 'Cycling'];

const summaryTemplates = [
  (name: string, nationality: string, family: number, interests: string[]) => 
    `${name} is ${nationality === 'USA' ? 'an American' : nationality === 'UK' ? 'a British' : `a ${nationality}`} guest ${family > 1 ? `traveling with ${family === 2 ? 'a partner' : `a family of ${family}`}` : 'traveling solo'} who frequently engages with our concierge chatbot. ${interests.length > 0 ? `Shows strong interest in ${interests.slice(0, 2).join(' and ').toLowerCase()}.` : ''} Has made multiple bookings and appreciates personalized recommendations through our chat system.`,
  
  (name: string, nationality: string, family: number, interests: string[]) => 
    `${name} is a ${nationality} professional who regularly uses our wellness chatbot to book experiences. ${family > 1 ? `Travels with ${family === 2 ? 'partner' : 'family'} and` : 'They'} seek ${interests.length > 0 ? interests[0].toLowerCase() : 'unique'} activities. Chat interactions reveal preferences for quality over quantity and appreciation for local authenticity.`,
  
  (name: string, nationality: string, family: number, interests: string[]) => 
    `${name} from ${nationality} has built an extensive interaction history through our chatbots. ${family > 1 ? `Family of ${family} that enjoys` : 'Solo traveler interested in'} ${interests.length > 0 ? interests.slice(0, 2).join(' and ').toLowerCase() : 'various activities'}. Values seamless booking experience and has provided positive feedback about chat recommendations.`,
  
  (name: string, nationality: string, family: number, interests: string[]) => 
    `${name} is ${nationality === 'USA' ? 'an American' : `a ${nationality}`} guest who actively uses our activities chatbot. ${interests.length > 0 ? `Passionate about ${interests[0].toLowerCase()} experiences.` : ''} ${family > 1 ? `Travels with group of ${family} and` : 'They'} consistently book premium experiences and appreciate detailed information through chat.`,
];

const generateGuests = (count: number): Guest[] => {
  const guests: Guest[] = [];
  
  for (let i = 0; i < count; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const name = `${firstName} ${lastName}`;
    const nationality = nationalities[Math.floor(Math.random() * nationalities.length)];
    const age = 22 + Math.floor(Math.random() * 60);
    const familySize = Math.random() > 0.4 ? (Math.random() > 0.6 ? 2 : (Math.random() > 0.5 ? 3 : 4)) : 1;
    const bookingsCount = Math.floor(Math.random() * 20) + 1;
    const satisfaction = Math.floor(Math.random() * 2) + 4; // 4 or 5
    const totalSpend = bookingsCount * (50 + Math.random() * 400);
    const isNewGuest = bookingsCount <= 2;
    const isTopGuest = totalSpend > 2000;
    const isRepeatGuest = bookingsCount >= 4;
    const isVIP = totalSpend > 2500 && bookingsCount >= 8;
    
    const tags: ('Top Guest' | 'Repeat Guest' | 'VIP' | 'New')[] = [];
    if (isVIP) tags.push('VIP', 'Top Guest');
    else if (isTopGuest) tags.push('Top Guest');
    if (isRepeatGuest && !isVIP) tags.push('Repeat Guest');
    if (isNewGuest) tags.push('New');
    
    const guestInterests: string[] = [];
    const interestCount = Math.floor(Math.random() * 4);
    for (let j = 0; j < interestCount; j++) {
      const interest = interests[Math.floor(Math.random() * interests.length)];
      if (!guestInterests.includes(interest)) {
        guestInterests.push(interest);
      }
    }
    
    const gatheringData = isNewGuest && Math.random() > 0.5;
    const hasSummary = !gatheringData && bookingsCount >= 3;
    
    const lastVisitDate = new Date(2026, 1, Math.floor(Math.random() * 14) + 1);
    
    guests.push({
      id: `${33450000 + i}`,
      name,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com`,
      interests: guestInterests,
      totalSpend: Math.round(totalSpend * 100) / 100,
      satisfaction,
      bookingsCount,
      lastVisit: lastVisitDate.toISOString().split('T')[0],
      tags,
      nationality,
      age,
      status: isVIP ? 'VIP' : 'Active',
      familySize,
      gatheringData,
      summary: hasSummary ? summaryTemplates[Math.floor(Math.random() * summaryTemplates.length)](name, nationality, familySize, guestInterests) : undefined
    });
  }
  
  return guests.sort((a, b) => b.totalSpend - a.totalSpend);
};

// Featured demo guest with complete profile
const sophiaMarksProfile: Guest = {
  id: '33450001',
  name: 'Sophia Marks',
  email: 'sophia.marks@email.com',
  interests: ['Culture', 'Gastronomy', 'Art', 'Wine Tasting', 'History'],
  totalSpend: 8750.00,
  satisfaction: 5,
  bookingsCount: 18,
  lastVisit: '2026-02-13',
  tags: ['VIP', 'Top Guest', 'Repeat Guest'],
  nationality: 'USA',
  age: 38,
  status: 'VIP',
  familySize: 2,
  summary: "Sophia is an American cultural enthusiast who travels with her partner, showing exceptional appreciation for authentic Portuguese experiences. Through 18 bookings, she's become a wine connoisseur (5 Douro Valley tours), fine dining devotee (multiple Michelin-starred experiences), and art lover (exclusive museum access). Her chatbot interactions reveal sophisticated taste—from private fado performances to cooking classes with local chefs. She's considering purchasing property in Portugal and has referred three couples who became regular guests. Sophia represents the perfect engaged guest: curious, generous, and deeply connected to local culture."
};

const mockGuests: Guest[] = [sophiaMarksProfile, ...generateGuests(1199)];

// Calculate analytics
const calculateAnalytics = () => {
  // Nationality breakdown
  const nationalityCounts = mockGuests.reduce((acc, guest) => {
    if (guest.nationality) {
      acc[guest.nationality] = (acc[guest.nationality] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const topNationalities = Object.entries(nationalityCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)
    .map(([country, count]) => ({
      country,
      count,
      percentage: (count / mockGuests.length) * 100
    }));

  // Age distribution
  const ageRanges = {
    '18-29': mockGuests.filter(g => g.age && g.age >= 18 && g.age <= 29).length,
    '30-39': mockGuests.filter(g => g.age && g.age >= 30 && g.age <= 39).length,
    '40-49': mockGuests.filter(g => g.age && g.age >= 40 && g.age <= 49).length,
    '50-59': mockGuests.filter(g => g.age && g.age >= 50 && g.age <= 59).length,
    '60+': mockGuests.filter(g => g.age && g.age >= 60).length,
  };

  // Status distribution
  const statusCounts = {
    Active: mockGuests.filter(g => g.status === 'Active').length,
    VIP: mockGuests.filter(g => g.status === 'VIP').length,
    Inactive: mockGuests.filter(g => g.status === 'Inactive').length,
  };

  // Revenue by segment
  const vipRevenue = mockGuests.filter(g => g.status === 'VIP').reduce((s, g) => s + g.totalSpend, 0);
  const topGuestRevenue = mockGuests.filter(g => g.tags.includes('Top Guest') && g.status !== 'VIP').reduce((s, g) => s + g.totalSpend, 0);
  const repeatRevenue = mockGuests.filter(g => g.tags.includes('Repeat Guest') && !g.tags.includes('Top Guest') && g.status !== 'VIP').reduce((s, g) => s + g.totalSpend, 0);
  const newGuestRevenue = mockGuests.filter(g => g.tags.includes('New')).reduce((s, g) => s + g.totalSpend, 0);
  const otherRevenue = mockGuests.reduce((s, g) => s + g.totalSpend, 0) - vipRevenue - topGuestRevenue - repeatRevenue - newGuestRevenue;
  const totalRevenue = mockGuests.reduce((s, g) => s + g.totalSpend, 0);

  // Booking frequency distribution
  const bookingBuckets = {
    '1 booking': mockGuests.filter(g => g.bookingsCount === 1).length,
    '2-3 bookings': mockGuests.filter(g => g.bookingsCount >= 2 && g.bookingsCount <= 3).length,
    '4-7 bookings': mockGuests.filter(g => g.bookingsCount >= 4 && g.bookingsCount <= 7).length,
    '8-12 bookings': mockGuests.filter(g => g.bookingsCount >= 8 && g.bookingsCount <= 12).length,
    '13+ bookings': mockGuests.filter(g => g.bookingsCount >= 13).length,
  };

  // Top interests overall
  const allInterests = mockGuests.flatMap(g => g.interests);
  const interestCounts = allInterests.reduce((acc, i) => { acc[i] = (acc[i] || 0) + 1; return acc; }, {} as Record<string, number>);
  const topInterests = Object.entries(interestCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([interest, count]) => ({ interest, count, percentage: (count / mockGuests.length) * 100 }));

  // Avg spend per nationality (top 5)
  const spendByNationality: Record<string, { total: number; count: number }> = {};
  mockGuests.forEach(g => {
    if (g.nationality) {
      if (!spendByNationality[g.nationality]) spendByNationality[g.nationality] = { total: 0, count: 0 };
      spendByNationality[g.nationality].total += g.totalSpend;
      spendByNationality[g.nationality].count += 1;
    }
  });
  const avgSpendByCountry = Object.entries(spendByNationality)
    .map(([country, { total, count }]) => ({ country, avgSpend: total / count, count }))
    .filter(c => c.count >= 5)
    .sort((a, b) => b.avgSpend - a.avgSpend)
    .slice(0, 6);

  // Family size distribution
  const familySizes = {
    'Solo': mockGuests.filter(g => g.familySize === 1).length,
    'Couple': mockGuests.filter(g => g.familySize === 2).length,
    'Family (3)': mockGuests.filter(g => g.familySize === 3).length,
    'Family (4+)': mockGuests.filter(g => g.familySize && g.familySize >= 4).length,
  };

  // Guest lifetime value tiers
  const ltvTiers = {
    '€0-100': mockGuests.filter(g => g.totalSpend <= 100).length,
    '€100-500': mockGuests.filter(g => g.totalSpend > 100 && g.totalSpend <= 500).length,
    '€500-1K': mockGuests.filter(g => g.totalSpend > 500 && g.totalSpend <= 1000).length,
    '€1K-3K': mockGuests.filter(g => g.totalSpend > 1000 && g.totalSpend <= 3000).length,
    '€3K+': mockGuests.filter(g => g.totalSpend > 3000).length,
  };

  // Monthly guest activity (simulated for last 6 months)
  const monthlyTrend = [
    { month: 'Sep', guests: 156, revenue: 42300 },
    { month: 'Oct', guests: 189, revenue: 51800 },
    { month: 'Nov', guests: 134, revenue: 38200 },
    { month: 'Dec', guests: 245, revenue: 72400 },
    { month: 'Jan', guests: 198, revenue: 58900 },
    { month: 'Feb', guests: 221, revenue: 64200 },
  ];

  // Insights
  const avgSpendPerGuest = totalRevenue / mockGuests.length;
  const avgBookings = mockGuests.reduce((s, g) => s + g.bookingsCount, 0) / mockGuests.length;
  const avgSatisfaction = mockGuests.reduce((s, g) => s + g.satisfaction, 0) / mockGuests.length;
  const repeatRate = (mockGuests.filter(g => g.tags.includes('Repeat Guest')).length / mockGuests.length) * 100;

  return {
    topNationalities,
    ageRanges,
    statusCounts,
    totalGuests: mockGuests.length,
    totalRevenue,
    avgSpendPerGuest,
    avgBookings,
    avgSatisfaction,
    repeatRate,
    vipRevenue,
    topGuestRevenue,
    repeatRevenue,
    newGuestRevenue,
    otherRevenue,
    bookingBuckets,
    topInterests,
    avgSpendByCountry,
    familySizes,
    ltvTiers,
    monthlyTrend,
  };
};

export const GuestsView: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<'all' | 'repeat' | 'top' | 'analytics'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);

  const analytics = calculateAnalytics();

  const filteredGuests = mockGuests.filter(guest => {
    const matchesSearch = guest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         guest.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (selectedTab === 'repeat') {
      return matchesSearch && guest.tags.includes('Repeat Guest');
    }
    if (selectedTab === 'top') {
      return matchesSearch && guest.tags.includes('Top Guest');
    }
    return matchesSearch;
  });

  if (selectedGuest) {
    return (
      <div className="max-w-7xl mx-auto px-8">
        {/* Back Button */}
        <button
          onClick={() => setSelectedGuest(null)}
          className="mb-8 flex items-center gap-2 text-sm text-bored-gray-500 hover:text-bored-black transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back to guests
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Guest Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Guest Card */}
            <div className="bg-white rounded-2xl border border-bored-gray-200 p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-bored-neon to-yellow-300 flex items-center justify-center text-bored-black font-bold text-xl">
                  {selectedGuest.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-bored-black mb-1">{selectedGuest.name}</h2>
                  <p className="text-sm text-bored-gray-500">{selectedGuest.email}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-8">
                {selectedGuest.tags.map(tag => (
                  <span
                    key={tag}
                    className="px-3 py-1.5 bg-bored-gray-50 text-bored-black text-xs font-medium rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="space-y-6 pt-6 border-t border-bored-gray-100">
                <div>
                  <p className="text-xs text-bored-gray-500 mb-2 uppercase tracking-wide">Total spend</p>
                  <p className="text-4xl font-light text-bored-black">€{selectedGuest.totalSpend.toLocaleString()}</p>
                </div>

                <div>
                  <p className="text-xs text-bored-gray-500 mb-3 uppercase tracking-wide">Satisfaction</p>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map(i => (
                      <Star
                        key={i}
                        size={18}
                        className={i <= selectedGuest.satisfaction ? 'fill-bored-black text-bored-black' : 'text-bored-gray-200'}
                      />
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div>
                    <p className="text-xs text-bored-gray-500 mb-1 uppercase tracking-wide">Bookings</p>
                    <p className="text-2xl font-light text-bored-black">{selectedGuest.bookingsCount}</p>
                  </div>
                  <div>
                    <p className="text-xs text-bored-gray-500 mb-1 uppercase tracking-wide">Last visit</p>
                    <p className="text-sm font-medium text-bored-black">{new Date(selectedGuest.lastVisit).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                  </div>
                </div>

                {selectedGuest.nationality && (
                  <div className="pt-4 border-t border-bored-gray-100">
                    <p className="text-xs text-bored-gray-500 mb-2 uppercase tracking-wide">Profile</p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-bored-black">{selectedGuest.nationality}</span>
                      {selectedGuest.age && <span className="text-bored-gray-500">·</span>}
                      {selectedGuest.age && <span className="text-bored-black">{selectedGuest.age} years</span>}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Interests Card */}
            {selectedGuest.interests.length > 0 && (
              <div className="bg-white rounded-2xl border border-bored-gray-200 p-8">
                <h3 className="text-xs text-bored-gray-500 mb-4 uppercase tracking-wide">Interests</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedGuest.interests.map(interest => (
                    <span
                      key={interest}
                      className="px-4 py-2 bg-bored-gray-50 text-bored-black text-sm rounded-lg"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Booking History & Activity */}
          <div className="lg:col-span-2 space-y-6">
            {/* Guest Summary Card */}
            <div className="bg-white rounded-2xl border border-bored-gray-200 p-8">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles size={20} className="text-bored-black" />
                <h3 className="text-lg font-semibold text-bored-black">Guest profile summary</h3>
              </div>
              
              {selectedGuest.gatheringData ? (
                <div className="bg-bored-gray-50 rounded-xl p-6 text-center">
                  <Sparkles size={32} className="text-bored-gray-400 mx-auto mb-3" />
                  <p className="text-sm text-bored-gray-600 italic">
                    We're currently gathering data from chatbot interactions to build a comprehensive profile of this guest's preferences and interests.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-bored-gray-50 to-white rounded-xl p-6 border border-bored-gray-100">
                    <p className="text-sm text-bored-gray-700 leading-relaxed">
                      {selectedGuest.summary || "No summary available yet. Guest interactions are being collected."}
                    </p>
                  </div>
                  
                  {selectedGuest.familySize && (
                    <div className="flex items-center gap-2 text-sm text-bored-gray-600">
                      <Users size={16} className="text-bored-gray-400" />
                      <span>Traveling with family of {selectedGuest.familySize}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-bored-gray-200 p-8">
              <h3 className="text-lg font-semibold text-bored-black mb-6">Recent activity</h3>
              <div className="space-y-6">
                {/* Sample bookings */}
                <div className="flex items-start gap-4 pb-6 border-b border-bored-gray-100">
                  <div className="w-12 h-12 rounded-lg bg-bored-gray-50 flex items-center justify-center flex-shrink-0">
                    <Calendar size={20} className="text-bored-black" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="text-sm font-medium text-bored-black">Sunset Yoga Session</h4>
                        <p className="text-xs text-bored-gray-500 mt-1">Feb 10, 2026 · 6:00 PM</p>
                      </div>
                      <span className="text-sm font-medium text-bored-black">€120</span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-3">
                      {[1, 2, 3, 4, 5].map(i => (
                        <Star key={i} size={14} className="fill-bored-black text-bored-black" />
                      ))}
                      <span className="text-xs text-bored-gray-500 ml-2">Loved the peaceful atmosphere</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4 pb-6 border-b border-bored-gray-100">
                  <div className="w-12 h-12 rounded-lg bg-bored-gray-50 flex items-center justify-center flex-shrink-0">
                    <Calendar size={20} className="text-bored-black" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="text-sm font-medium text-bored-black">Vineyard Tour & Wine Tasting</h4>
                        <p className="text-xs text-bored-gray-500 mt-1">Feb 8, 2026 · 2:00 PM</p>
                      </div>
                      <span className="text-sm font-medium text-bored-black">€85</span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-3">
                      {[1, 2, 3, 4, 5].map(i => (
                        <Star key={i} size={14} className={i <= 4 ? 'fill-bored-black text-bored-black' : 'text-bored-gray-200'} />
                      ))}
                      <span className="text-xs text-bored-gray-500 ml-2">Great experience</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-bored-gray-50 flex items-center justify-center flex-shrink-0">
                    <Calendar size={20} className="text-bored-black" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="text-sm font-medium text-bored-black">Private Chef Dinner</h4>
                        <p className="text-xs text-bored-gray-500 mt-1">Jan 28, 2026 · 7:30 PM</p>
                      </div>
                      <span className="text-sm font-medium text-bored-black">€220</span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-3">
                      {[1, 2, 3, 4, 5].map(i => (
                        <Star key={i} size={14} className="fill-bored-black text-bored-black" />
                      ))}
                      <span className="text-xs text-bored-gray-500 ml-2">Incredible culinary experience</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-8">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-light text-bored-black mb-2">Guests</h1>
        <p className="text-bored-gray-500">Manage and understand your guest relationships</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <div className="bg-white rounded-2xl border border-bored-gray-200 p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-bored-gray-500 uppercase tracking-wide">Total guests</span>
            <Users size={18} className="text-bored-gray-400" />
          </div>
          <p className="text-3xl font-light text-bored-black">{mockGuests.length}</p>
        </div>

        <div className="bg-white rounded-2xl border border-bored-gray-200 p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-bored-gray-500 uppercase tracking-wide">VIP guests</span>
            <Star size={18} className="text-bored-gray-400" />
          </div>
          <p className="text-3xl font-light text-bored-black">{mockGuests.filter(g => g.status === 'VIP').length}</p>
        </div>

        <div className="bg-white rounded-2xl border border-bored-gray-200 p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-bored-gray-500 uppercase tracking-wide">Avg. satisfaction</span>
            <BarChart3 size={18} className="text-bored-gray-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-light text-bored-black">
              {(mockGuests.reduce((sum, g) => sum + g.satisfaction, 0) / mockGuests.length).toFixed(1)}
            </p>
            <span className="text-sm text-bored-gray-400">/ 5.0</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-bored-gray-200 p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-bored-gray-500 uppercase tracking-wide">Repeat rate</span>
            <TrendingUp size={18} className="text-bored-gray-400" />
          </div>
          <p className="text-3xl font-light text-bored-black">
            {Math.round((mockGuests.filter(g => g.tags.includes('Repeat Guest')).length / mockGuests.length) * 100)}%
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-8 border-b border-bored-gray-200">
        <button
          onClick={() => setSelectedTab('all')}
          className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
            selectedTab === 'all'
              ? 'border-bored-black text-bored-black'
              : 'border-transparent text-bored-gray-500 hover:text-bored-black'
          }`}
        >
          All guests
        </button>
        <button
          onClick={() => setSelectedTab('repeat')}
          className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
            selectedTab === 'repeat'
              ? 'border-bored-black text-bored-black'
              : 'border-transparent text-bored-gray-500 hover:text-bored-black'
          }`}
        >
          Repeat guests
        </button>
        <button
          onClick={() => setSelectedTab('top')}
          className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
            selectedTab === 'top'
              ? 'border-bored-black text-bored-black'
              : 'border-transparent text-bored-gray-500 hover:text-bored-black'
          }`}
        >
          Top spenders
        </button>
        <button
          onClick={() => setSelectedTab('analytics')}
          className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
            selectedTab === 'analytics'
              ? 'border-bored-black text-bored-black'
              : 'border-transparent text-bored-gray-500 hover:text-bored-black'
          }`}
        >
          Analytics
        </button>
      </div>

      {selectedTab === 'analytics' ? (
        /* Analytics View */
        <div className="space-y-8">

          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white rounded-2xl border border-bored-gray-200 p-5">
              <p className="text-xs text-bored-gray-500 uppercase tracking-wide mb-1">Total revenue</p>
              <p className="text-2xl font-light text-bored-black">€{Math.round(analytics.totalRevenue).toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-2xl border border-bored-gray-200 p-5">
              <p className="text-xs text-bored-gray-500 uppercase tracking-wide mb-1">Avg. spend / guest</p>
              <p className="text-2xl font-light text-bored-black">€{Math.round(analytics.avgSpendPerGuest)}</p>
            </div>
            <div className="bg-white rounded-2xl border border-bored-gray-200 p-5">
              <p className="text-xs text-bored-gray-500 uppercase tracking-wide mb-1">Avg. bookings</p>
              <p className="text-2xl font-light text-bored-black">{analytics.avgBookings.toFixed(1)}</p>
            </div>
            <div className="bg-white rounded-2xl border border-bored-gray-200 p-5">
              <p className="text-xs text-bored-gray-500 uppercase tracking-wide mb-1">Avg. satisfaction</p>
              <div className="flex items-baseline gap-1.5">
                <p className="text-2xl font-light text-bored-black">{analytics.avgSatisfaction.toFixed(1)}</p>
                <span className="text-sm text-bored-gray-400">/ 5</span>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-bored-gray-200 p-5">
              <p className="text-xs text-bored-gray-500 uppercase tracking-wide mb-1">Repeat rate</p>
              <p className="text-2xl font-light text-bored-black">{analytics.repeatRate.toFixed(0)}%</p>
            </div>
          </div>

          {/* Revenue by Segment + Monthly Trend */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Revenue by Guest Segment */}
            <div className="bg-white rounded-2xl border border-bored-gray-200 p-8">
              <h3 className="text-lg font-semibold text-bored-black mb-6">Revenue by guest segment</h3>
              <div className="space-y-4">
                {[
                  { label: 'VIP guests', value: analytics.vipRevenue, color: 'from-yellow-400 to-amber-500' },
                  { label: 'Top spenders', value: analytics.topGuestRevenue, color: 'from-blue-400 to-indigo-500' },
                  { label: 'Repeat guests', value: analytics.repeatRevenue, color: 'from-emerald-400 to-green-500' },
                  { label: 'New guests', value: analytics.newGuestRevenue, color: 'from-purple-400 to-violet-500' },
                  { label: 'Other', value: analytics.otherRevenue, color: 'from-gray-300 to-gray-400' },
                ].map(seg => {
                  const pct = (seg.value / analytics.totalRevenue) * 100;
                  return (
                    <div key={seg.label}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-medium text-bored-black">{seg.label}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-bored-gray-400">{pct.toFixed(1)}%</span>
                          <span className="text-sm font-medium text-bored-black">€{Math.round(seg.value).toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="h-2 bg-bored-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full bg-gradient-to-r ${seg.color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Monthly Trend */}
            <div className="bg-white rounded-2xl border border-bored-gray-200 p-8">
              <h3 className="text-lg font-semibold text-bored-black mb-6">Monthly trend</h3>
              <div className="flex items-end gap-3 h-[200px]">
                {analytics.monthlyTrend.map(m => {
                  const maxRev = Math.max(...analytics.monthlyTrend.map(t => t.revenue));
                  const h = (m.revenue / maxRev) * 100;
                  return (
                    <div key={m.month} className="flex-1 flex flex-col items-center gap-2">
                      <span className="text-xs font-medium text-bored-black">€{(m.revenue / 1000).toFixed(0)}k</span>
                      <div className="w-full flex flex-col items-center" style={{ height: '160px' }}>
                        <div className="flex-1" />
                        <div
                          className="w-full bg-gradient-to-t from-bored-neon to-yellow-200 rounded-t-lg transition-all"
                          style={{ height: `${h}%`, minHeight: '8px' }}
                        />
                      </div>
                      <div className="text-center">
                        <span className="text-xs text-bored-gray-500">{m.month}</span>
                        <p className="text-[10px] text-bored-gray-400">{m.guests} guests</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Demographics Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Top Nationalities */}
            <div className="bg-white rounded-2xl border border-bored-gray-200 p-8 lg:col-span-1">
              <h3 className="text-lg font-semibold text-bored-black mb-6">Top nationalities</h3>
              <div className="space-y-3">
                {analytics.topNationalities.map((item, index) => (
                  <div key={item.country} className="flex items-center gap-3">
                    <span className="text-xs text-bored-gray-400 w-4 font-medium">{index + 1}</span>
                    <span className="text-sm font-medium text-bored-black w-20 truncate">{item.country}</span>
                    <div className="flex-1 h-1.5 bg-bored-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-bored-neon to-yellow-300 rounded-full" style={{ width: `${item.percentage}%` }} />
                    </div>
                    <span className="text-xs text-bored-gray-500 w-14 text-right">{item.percentage.toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Age Distribution */}
            <div className="bg-white rounded-2xl border border-bored-gray-200 p-8">
              <h3 className="text-lg font-semibold text-bored-black mb-6">Age distribution</h3>
              <div className="flex items-end gap-2 h-[200px]">
                {Object.entries(analytics.ageRanges).map(([range, count]) => {
                  const maxCount = Math.max(...Object.values(analytics.ageRanges));
                  const h = (count / maxCount) * 100;
                  const pct = ((count / analytics.totalGuests) * 100).toFixed(1);
                  return (
                    <div key={range} className="flex-1 flex flex-col items-center gap-2">
                      <span className="text-xs font-medium text-bored-black">{pct}%</span>
                      <div className="w-full flex flex-col items-center" style={{ height: '140px' }}>
                        <div className="flex-1" />
                        <div className="w-full bg-gradient-to-t from-bored-black/80 to-bored-black/20 rounded-t-lg" style={{ height: `${h}%`, minHeight: '4px' }} />
                      </div>
                      <span className="text-[10px] text-bored-gray-500">{range}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Family Size */}
            <div className="bg-white rounded-2xl border border-bored-gray-200 p-8">
              <h3 className="text-lg font-semibold text-bored-black mb-6">Travel group</h3>
              <div className="space-y-4">
                {Object.entries(analytics.familySizes).map(([label, count]) => {
                  const pct = (count / analytics.totalGuests) * 100;
                  const icons = label === 'Solo' ? '👤' : label === 'Couple' ? '👫' : label === 'Family (3)' ? '👨‍👩‍👦' : '👨‍👩‍👧‍👦';
                  return (
                    <div key={label} className="flex items-center gap-3">
                      <span className="text-xl w-8">{icons}</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-bored-black">{label}</span>
                          <span className="text-xs text-bored-gray-500">{pct.toFixed(0)}%</span>
                        </div>
                        <div className="h-1.5 bg-bored-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-bored-black/20 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Interests + Guest LTV + Spend by Country */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Top Interests Heatmap */}
            <div className="bg-white rounded-2xl border border-bored-gray-200 p-8 lg:col-span-1">
              <h3 className="text-lg font-semibold text-bored-black mb-6">Popular interests</h3>
              <div className="flex flex-wrap gap-2">
                {analytics.topInterests.map(item => {
                  const intensity = Math.min(item.percentage / 30, 1);
                  return (
                    <div
                      key={item.interest}
                      className="px-3 py-2 rounded-lg text-sm font-medium transition-all"
                      style={{
                        backgroundColor: `rgba(200, 255, 0, ${0.1 + intensity * 0.4})`,
                        color: intensity > 0.5 ? '#1a1a1a' : '#6b7280',
                        fontSize: `${0.75 + intensity * 0.25}rem`,
                      }}
                    >
                      {item.interest}
                      <span className="ml-1.5 text-[10px] opacity-60">{item.percentage.toFixed(0)}%</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Guest Lifetime Value */}
            <div className="bg-white rounded-2xl border border-bored-gray-200 p-8">
              <h3 className="text-lg font-semibold text-bored-black mb-6">Guest lifetime value</h3>
              <div className="space-y-3">
                {Object.entries(analytics.ltvTiers).map(([tier, count]) => {
                  const pct = (count / analytics.totalGuests) * 100;
                  return (
                    <div key={tier}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-bored-gray-700">{tier}</span>
                        <span className="text-xs text-bored-gray-500">{count} guests · {pct.toFixed(0)}%</span>
                      </div>
                      <div className="h-2 bg-bored-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Avg Spend by Country */}
            <div className="bg-white rounded-2xl border border-bored-gray-200 p-8">
              <h3 className="text-lg font-semibold text-bored-black mb-6">Avg. spend by country</h3>
              <div className="space-y-3">
                {analytics.avgSpendByCountry.map((item, i) => (
                  <div key={item.country} className="flex items-center gap-3">
                    <span className="text-xs text-bored-gray-400 w-4 font-medium">{i + 1}</span>
                    <span className="text-sm font-medium text-bored-black w-20 truncate">{item.country}</span>
                    <div className="flex-1 h-1.5 bg-bored-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full"
                        style={{ width: `${(item.avgSpend / analytics.avgSpendByCountry[0].avgSpend) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-bored-black w-16 text-right">€{Math.round(item.avgSpend)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Booking Frequency */}
          <div className="bg-white rounded-2xl border border-bored-gray-200 p-8">
            <h3 className="text-lg font-semibold text-bored-black mb-6">Booking frequency distribution</h3>
            <div className="flex items-end gap-4 h-[180px]">
              {Object.entries(analytics.bookingBuckets).map(([bucket, count]) => {
                const maxB = Math.max(...Object.values(analytics.bookingBuckets));
                const h = (count / maxB) * 100;
                const pct = ((count / analytics.totalGuests) * 100).toFixed(1);
                return (
                  <div key={bucket} className="flex-1 flex flex-col items-center gap-2">
                    <span className="text-xs font-medium text-bored-black">{count}</span>
                    <div className="w-full flex flex-col items-center" style={{ height: '120px' }}>
                      <div className="flex-1" />
                      <div className="w-full bg-gradient-to-t from-violet-500 to-violet-200 rounded-t-lg" style={{ height: `${h}%`, minHeight: '4px' }} />
                    </div>
                    <div className="text-center">
                      <span className="text-[10px] text-bored-gray-500 leading-tight block">{bucket}</span>
                      <span className="text-[10px] text-bored-gray-400">{pct}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Guest Status Overview */}
          <div className="bg-white rounded-2xl border border-bored-gray-200 p-8">
            <h3 className="text-lg font-semibold text-bored-black mb-6">Guest segments overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { label: 'VIP', count: analytics.statusCounts.VIP, color: 'bg-yellow-400', desc: 'High spend + frequent' },
                { label: 'Top Spenders', count: mockGuests.filter(g => g.tags.includes('Top Guest')).length, color: 'bg-blue-400', desc: '€2,000+ total spend' },
                { label: 'Repeat', count: mockGuests.filter(g => g.tags.includes('Repeat Guest')).length, color: 'bg-emerald-400', desc: '4+ bookings' },
                { label: 'New', count: mockGuests.filter(g => g.tags.includes('New')).length, color: 'bg-purple-400', desc: '1-2 bookings' },
              ].map(seg => (
                <div key={seg.label} className="p-5 rounded-xl bg-bored-gray-50 border border-bored-gray-100">
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`w-3 h-3 rounded-full ${seg.color}`} />
                    <span className="text-sm font-semibold text-bored-black">{seg.label}</span>
                  </div>
                  <p className="text-3xl font-light text-bored-black">{seg.count}</p>
                  <p className="text-xs text-bored-gray-500 mt-1">{seg.desc}</p>
                  <p className="text-xs text-bored-gray-400 mt-0.5">{((seg.count / analytics.totalGuests) * 100).toFixed(1)}% of total</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Guests List View */
        <>
          {/* Search Bar */}
          <div className="flex items-center gap-4 mb-8">
            <div className="relative flex-1 max-w-md">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-bored-gray-400" />
              <input
                type="text"
                placeholder="Search guests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-bored-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-bored-gray-300 text-sm bg-white transition-all"
              />
            </div>
          </div>

          {/* Guests Grid */}
          <div className="grid grid-cols-1 gap-4">
            {filteredGuests.map((guest) => (
              <button
                key={guest.id}
                onClick={() => setSelectedGuest(guest)}
                className="bg-white rounded-2xl border border-bored-gray-200 p-6 hover:border-bored-gray-300 transition-all text-left group"
              >
                <div className="flex items-start gap-6">
                  {/* Avatar */}
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-bored-neon to-yellow-300 flex items-center justify-center flex-shrink-0 text-bored-black font-semibold">
                    {guest.name.split(' ').map(n => n[0]).join('')}
                  </div>

                  {/* Guest Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-base font-medium text-bored-black group-hover:text-bored-black transition-colors">
                            {guest.name}
                          </h3>
                          {guest.familySize && (
                            <span className="text-xs text-bored-gray-400 flex items-center gap-1">
                              <Users size={12} />
                              Family of {guest.familySize}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-bored-gray-500">{guest.email}</p>
                      </div>
                      <ArrowUpRight size={18} className="text-bored-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>

                    {/* Summary Preview */}
                    {guest.summary && !guest.gatheringData && (
                      <p className="text-sm text-bored-gray-600 mb-4 line-clamp-2 leading-relaxed">
                        {guest.summary}
                      </p>
                    )}

                    {guest.gatheringData && (
                      <p className="text-xs text-bored-gray-400 italic mb-4">
                        Gathering interaction data from chatbots...
                      </p>
                    )}

                    <div className="flex items-center gap-4 mt-4">
                      {/* Interests */}
                      {guest.interests.length > 0 ? (
                        <div className="flex gap-2">
                          {guest.interests.slice(0, 3).map(interest => (
                            <span
                              key={interest}
                              className="px-3 py-1 bg-bored-gray-50 text-bored-black text-xs rounded-lg"
                            >
                              {interest}
                            </span>
                          ))}
                        </div>
                      ) : !guest.gatheringData && (
                        <span className="text-xs text-bored-gray-400 italic">No interests captured yet</span>
                      )}

                      {/* Stats */}
                      <div className="flex items-center gap-6 ml-auto text-sm">
                        <div className="text-right">
                          <p className="text-xs text-bored-gray-500">Spend</p>
                          <p className="font-medium text-bored-black">€{guest.totalSpend.toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-bored-gray-500">Bookings</p>
                          <p className="font-medium text-bored-black">{guest.bookingsCount}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map(i => (
                            <Star
                              key={i}
                              size={14}
                              className={i <= guest.satisfaction ? 'fill-bored-black text-bored-black' : 'text-bored-gray-200'}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16 pt-16 border-t border-bored-gray-200">
            <div className="group">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-bored-gray-50 to-white border border-bored-gray-200 flex items-center justify-center mb-4 group-hover:border-bored-gray-300 transition-colors">
                <User size={20} className="text-bored-black" />
              </div>
              <h4 className="text-sm font-semibold text-bored-black mb-2">Personal profiles</h4>
              <p className="text-xs text-bored-gray-600 leading-relaxed">
                Track preferences and history for every guest across all properties and stays.
              </p>
            </div>

            <div className="group">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-bored-gray-50 to-white border border-bored-gray-200 flex items-center justify-center mb-4 group-hover:border-bored-gray-300 transition-colors">
                <Sparkles size={20} className="text-bored-black" />
              </div>
              <h4 className="text-sm font-semibold text-bored-black mb-2">Intelligent insights</h4>
              <p className="text-xs text-bored-gray-600 leading-relaxed">
                Discover patterns and receive personalized suggestions for meaningful interactions.
              </p>
            </div>

            <div className="group">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-bored-gray-50 to-white border border-bored-gray-200 flex items-center justify-center mb-4 group-hover:border-bored-gray-300 transition-colors">
                <Calendar size={20} className="text-bored-black" />
              </div>
              <h4 className="text-sm font-semibold text-bored-black mb-2">Complete history</h4>
              <p className="text-xs text-bored-gray-600 leading-relaxed">
                Access booking records, notes, and recommendations in one unified view.
              </p>
            </div>

            <div className="group">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-bored-gray-50 to-white border border-bored-gray-200 flex items-center justify-center mb-4 group-hover:border-bored-gray-300 transition-colors">
                <TrendingUp size={20} className="text-bored-black" />
              </div>
              <h4 className="text-sm font-semibold text-bored-black mb-2">CRM integration</h4>
              <p className="text-xs text-bored-gray-600 leading-relaxed">
                Sync seamlessly with your existing systems to centralize guest data.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
