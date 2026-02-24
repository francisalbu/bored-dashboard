import React, { useState } from 'react';
import { Sidebar } from './components/Layout/Sidebar';
import { ReviewsView } from './components/Dashboard/ReviewsView';
import { HomeView } from './components/Dashboard/HomeView';
import { CalendarView } from './components/Dashboard/CalendarView';
import { GuestsView } from './components/Dashboard/GuestsView';
import { AnalyticsView } from './components/Dashboard/AnalyticsView';
import { BookingsView } from './components/Dashboard/BookingsView';
import { EarningsView } from './components/Dashboard/EarningsView';
import { SiteSettingsView } from './components/Dashboard/SiteSettingsView';
import { CatalogView } from './components/Dashboard/CatalogView';
import {
  BarChart3,
  Calendar as CalendarIcon,
  Users,
} from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState('home');

  // Content Renderer
  const renderContent = () => {
    // 1. HOME VIEW
    if (currentView === 'home') {
      return <HomeView />;
    }

    // 2. REVIEWS VIEW
    if (currentView === 'reviews') {
      return <ReviewsView />;
    }

    // 2.5 CALENDAR VIEW
    if (currentView === 'calendar_view') {
      return <CalendarView />;
    }

    // 2.6 ANALYTICS VIEW
    if (currentView === 'analytics') {
      return <AnalyticsView />;
    }

    // 2.7 BOOKINGS VIEW
    if (currentView === 'bookings') {
      return <BookingsView />;
    }

    // 2.8 EARNINGS VIEW
    if (currentView === 'earnings') {
      return <EarningsView />;
    }

    // 2.9 GUESTS VIEW
    if (currentView === 'guests') {
      return <GuestsView />;
    }

    // 3. SITE SETTINGS VIEW
    if (currentView === 'site_settings') {
      return <SiteSettingsView />;
    }

    // 4. CATALOG / INVENTORY VIEWS
    if (['activities', 'spa', 'rentals', 'packages'].includes(currentView)) {
      return <CatalogView catalogSection={currentView} />;
    }

    // 4. PLACEHOLDER VIEWS FOR OTHER SECTIONS
    return (
      <div className="max-w-6xl mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-16 h-16 rounded-full bg-bored-neon/20 flex items-center justify-center mb-4">
          {currentView === 'analytics' && <BarChart3 size={32} className="text-bored-black" />}
          {currentView === 'earnings' && <span className="text-2xl font-bold text-bored-black">€</span>}
          {currentView === 'calendar_view' && <CalendarIcon size={32} className="text-bored-black" />}
          {currentView === 'guests' && <Users size={32} className="text-bored-black" />}
          {currentView === 'bookings' && <CalendarIcon size={32} className="text-bored-black" />}
        </div>
        <h2 className="text-2xl font-bold text-bored-gray-900 capitalize mb-2">{currentView.replace('_', ' ')}</h2>
        <p className="text-bored-gray-500 max-w-md">
          This module is part of the "Bored." Experience Management System. Select <strong>Home</strong>, <strong>Reviews</strong> or <strong>Catalog</strong> items to see the fully detailed views.
        </p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-bored-gray-50 via-white to-bored-gray-50 flex">
      {/* Sidebar Navigation */}
      <Sidebar currentView={currentView} onNavigate={setCurrentView} />

      {/* Main Content Area */}
      <main className="flex-1 ml-64 py-12 overflow-y-auto h-screen">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;