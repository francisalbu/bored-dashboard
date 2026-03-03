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
import { SuperAdminView } from './components/Dashboard/SuperAdminView';
import { LoginPage } from './components/Auth/LoginPage';
import { HotelSelector } from './components/Auth/HotelSelector';
import { AuthProvider, useAuth } from './lib/authContext';
import { supabase } from './lib/supabase';
import {
  BarChart3,
  Calendar as CalendarIcon,
  Users,
  Loader2,
  Building2,
  MapPin,
  ChevronRight,
} from 'lucide-react';

// ─── Persistent hotel context bar (top of every view) ────────────────────────
const HotelContextBar: React.FC = () => {
  const { activeHotelId, hotels } = useAuth();
  const hotel = hotels.find(h => h.id === activeHotelId);
  if (!hotel) return null;

  return (
    <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-bored-gray-100">
      <div className="px-8 py-3 flex items-center gap-3">
        {/* Hotel logo or icon */}
        {hotel.logo_url ? (
          <img
            src={hotel.logo_url}
            alt=""
            className="w-6 h-6 rounded-md object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-6 h-6 rounded-md bg-bored-gray-100 flex items-center justify-center flex-shrink-0">
            <Building2 size={11} className="text-bored-gray-400" />
          </div>
        )}

        {/* Breadcrumb: Group > Hotel · Location */}
        <div className="flex items-center gap-1.5 min-w-0">
          {hotel.group_name && (
            <>
              <span className="text-xs text-bored-gray-400 truncate">{hotel.group_name}</span>
              <ChevronRight size={11} className="text-bored-gray-300 flex-shrink-0" />
            </>
          )}
          <span className="text-xs font-semibold text-bored-black truncate">{hotel.name}</span>
          {hotel.location && (
            <>
              <span className="text-bored-gray-200 text-xs flex-shrink-0">·</span>
              <span className="text-xs text-bored-gray-400 flex items-center gap-1 flex-shrink-0">
                <MapPin size={10} />
                {hotel.location}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Inner dashboard — only rendered when auth is confirmed ──────────────────
const Dashboard: React.FC = () => {
  const { loading, user, activeHotelId, hotels, profile } = useAuth();
  const [currentView, setCurrentView] = useState('home');

  // Full-screen loader while resolving auth + profile
  if (loading) {
    return (
      <div className="min-h-screen bg-bored-gray-50 flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-bored-gray-300" />
      </div>
    );
  }

  // Not logged in → show login
  if (!user) return <LoginPage />;

  // Logged in but profile missing (migration not run, or user not in dashboard_users)
  if (!profile) {
    return (
      <div className="min-h-screen bg-bored-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-red-100 mb-4">
            <Building2 size={22} className="text-red-500" />
          </div>
          <h2 className="text-lg font-semibold text-bored-black mb-2">Account not set up</h2>
          <p className="text-sm text-bored-gray-500 mb-4">
            Your account exists but has no dashboard profile yet.<br />
            Ask your admin to run the setup migrations.
          </p>
          <button
            onClick={() => supabase.auth.signOut()}
            className="text-sm text-bored-gray-400 underline hover:text-bored-black"
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }

  // Logged in, profile loaded, but no hotels assigned
  if (hotels.length === 0) {
    return (
      <div className="min-h-screen bg-bored-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-bored-gray-100 mb-4">
            <Building2 size={22} className="text-bored-gray-400" />
          </div>
          <h2 className="text-lg font-semibold text-bored-black mb-2">No hotels assigned</h2>
          <p className="text-sm text-bored-gray-500 mb-4">
            Your account isn't linked to any hotel yet.<br />
            Ask your admin to assign you to a property.
          </p>
          <button
            onClick={() => supabase.auth.signOut()}
            className="text-sm text-bored-gray-400 underline hover:text-bored-black"
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }

  // Logged in, profile loaded, has hotels, but none selected yet → show selector
  if (!activeHotelId) return <HotelSelector />;

  // Content Renderer — every view receives hotelId so it can scope its data
  const renderContent = () => {
    if (currentView === 'home')         return <HomeView         hotelId={activeHotelId} />;
    if (currentView === 'reviews')      return <ReviewsView      hotelId={activeHotelId} />;
    if (currentView === 'calendar_view')return <CalendarView     hotelId={activeHotelId} />;
    if (currentView === 'analytics')    return <AnalyticsView    hotelId={activeHotelId} />;
    if (currentView === 'bookings')     return <BookingsView     hotelId={activeHotelId} />;
    if (currentView === 'earnings')     return <EarningsView     hotelId={activeHotelId} />;
    if (currentView === 'guests')       return <GuestsView       hotelId={activeHotelId} />;
    if (currentView === 'site_settings')return <SiteSettingsView activeHotelId={activeHotelId} />;
    if (currentView === 'admin' && profile?.role === 'super_admin') return <SuperAdminView />;
    if (['activities', 'spa', 'rentals', 'packages'].includes(currentView)) {
      return <CatalogView catalogSection={currentView} activeHotelId={activeHotelId} />;
    }

    return (
      <div className="max-w-6xl mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-16 h-16 rounded-full bg-bored-neon/20 flex items-center justify-center mb-4">
          {currentView === 'analytics'    && <BarChart3    size={32} className="text-bored-black" />}
          {currentView === 'earnings'     && <span className="text-2xl font-bold text-bored-black">€</span>}
          {currentView === 'calendar_view'&& <CalendarIcon size={32} className="text-bored-black" />}
          {currentView === 'guests'       && <Users        size={32} className="text-bored-black" />}
          {currentView === 'bookings'     && <CalendarIcon size={32} className="text-bored-black" />}
        </div>
        <h2 className="text-2xl font-bold text-bored-gray-900 capitalize mb-2">{currentView.replace('_', ' ')}</h2>
        <p className="text-bored-gray-500 max-w-md">
          This module is part of the "Bored." Experience Management System.
        </p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-bored-gray-50 via-white to-bored-gray-50 flex">
      <Sidebar currentView={currentView} onNavigate={setCurrentView} />
      <main className="flex-1 ml-64 overflow-y-auto h-screen flex flex-col">
        {/* Always-visible hotel breadcrumb — scopes every view to the active hotel */}
        <HotelContextBar />
        {/* key forces a full remount whenever the active hotel changes */}
        <div key={activeHotelId ?? 'no-hotel'} className="flex-1 py-12">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

// ─── Root — wraps everything in AuthProvider ──────────────────────────────────
const App: React.FC = () => (
  <AuthProvider>
    <Dashboard />
  </AuthProvider>
);

export default App;