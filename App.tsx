import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Layout/Sidebar';
import { BookableUnitsTab } from './components/Dashboard/BookableUnitsTab';
import { ReviewsView } from './components/Dashboard/ReviewsView';
import { HomeView } from './components/Dashboard/HomeView';
import { CalendarView } from './components/Dashboard/CalendarView';
import { GuestsView } from './components/Dashboard/GuestsView';
import { AnalyticsView } from './components/Dashboard/AnalyticsView';
import { BookingsView } from './components/Dashboard/BookingsView';
import { EarningsView } from './components/Dashboard/EarningsView';
import { ExperienceList } from './components/Dashboard/ExperienceList';
import { ExperiencePreview } from './components/Dashboard/ExperiencePreview';
import { TabOption, ExperienceDetails, BookableUnit } from './types';
import { getMockActivities, getMockRentals, getMockSpa, getMockTransfers, getMockDining, getMockPackages } from './constants';
import { 
  ChevronRight, 
  ExternalLink, 
  Save,
  Image as ImageIcon,
  Info,
  Calendar,
  Settings as SettingsIcon,
  Layers,
  BarChart3,
  Calendar as CalendarIcon,
  Users,
  Plus
} from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState('home'); // Default to home view
  const [activeTab, setActiveTab] = useState<TabOption>('general');
  const [viewMode, setViewMode] = useState<'list' | 'preview' | 'edit'>('list');
  const [experiences, setExperiences] = useState<ExperienceDetails[]>([]);
  const [selectedExperience, setSelectedExperience] = useState<ExperienceDetails | null>(null);

  // Data fetching simulation
  useEffect(() => {
    setViewMode('list');
    setSelectedExperience(null);
    switch(currentView) {
      case 'activities':
        setExperiences([getMockActivities()]);
        break;
      case 'spa':
        setExperiences(getMockSpa());
        break;
      case 'rentals':
        setExperiences(getMockRentals());
        break;
      case 'transfers':
        setExperiences(getMockTransfers());
        break;
      case 'tables':
        setExperiences(getMockDining());
        break;
      case 'packages':
        setExperiences(getMockPackages());
        break;
      // Other views don't use this specific 'data' state the same way
    }
  }, [currentView]);

  // Handle clicking on an experience card to show preview
  const handleExperienceClick = (experience: ExperienceDetails) => {
    setSelectedExperience(experience);
    setViewMode('preview');
  };

  // Handle clicking Edit button on preview page
  const handleEditClick = () => {
    setViewMode('edit');
    setActiveTab('general');
  };

  // Handle going back to experience list from preview or edit
  const handleBackToList = () => {
    setSelectedExperience(null);
    setViewMode('list');
    setActiveTab('units');
  };

  // Handle going back to preview from edit mode
  const handleBackToPreview = () => {
    setViewMode('preview');
  };

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

    // 3. CATALOG / INVENTORY VIEWS
    if (['activities', 'spa', 'rentals', 'transfers', 'tables', 'packages'].includes(currentView)) {
      const categoryName = experiences[0]?.category || 'Catalog';
      
      // PREVIEW MODE - Show experience with all variants
      if (viewMode === 'preview' && selectedExperience) {
        return (
          <ExperiencePreview 
            experience={selectedExperience}
            onEdit={handleEditClick}
            onBack={handleBackToList}
          />
        );
      }

      // EDIT MODE - Full edit interface with tabs  
      if (viewMode === 'edit' && selectedExperience) {
        return (
          <div className="max-w-5xl mx-auto">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 text-sm text-bored-gray-500 mb-4">
              <span className="cursor-pointer hover:text-bored-gray-900" onClick={handleBackToList}>Catalog</span>
              <ChevronRight size={14} />
              <span className="cursor-pointer hover:text-bored-gray-900" onClick={handleBackToPreview}>{categoryName}</span>
              <ChevronRight size={14} />
              <span className="font-medium text-bored-gray-900">{selectedExperience.title}</span>
            </nav>

            {/* Title & Actions */}
            <div className="flex items-start justify-between mb-8">
              <div className="space-y-3">
                <button
                  onClick={handleBackToPreview}
                  className="flex items-center gap-2 text-sm text-bored-gray-500 hover:text-bored-gray-900 mb-2"
                >
                  <ChevronRight size={16} className="rotate-180" />
                  Back to Preview
                </button>
                <h1 className="text-3xl font-bold text-bored-gray-900 tracking-tight">
                  {selectedExperience.title}
                </h1>
              </div>

              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-bored-gray-200 text-bored-gray-900 rounded-lg hover:bg-bored-gray-50 text-sm font-medium transition-colors">
                  <ExternalLink size={16} />
                  Preview
                </button>
                <button className="flex items-center gap-2 px-5 py-2 bg-bored-black text-white rounded-lg hover:bg-bored-gray-800 text-sm font-medium shadow-sm transition-colors">
                  <Save size={16} />
                  Save
                </button>
              </div>
            </div>

            {/* Tabs Navigation */}
            <div className="border-b border-bored-gray-200 mb-8">
              <div className="flex gap-8">
                <TabButton 
                  active={activeTab === 'general'} 
                  onClick={() => setActiveTab('general')} 
                  label="Experience page"
                  icon={<Info size={16} />} 
                />
                <TabButton 
                  active={activeTab === 'calendar'} 
                  onClick={() => setActiveTab('calendar')} 
                  label="Dates & Prices"
                  icon={<Calendar size={16} />} 
                />
                <TabButton 
                  active={activeTab === 'settings'} 
                  onClick={() => setActiveTab('settings')} 
                  label="Translations"
                  icon={<SettingsIcon size={16} />} 
                />
                <TabButton 
                  active={activeTab === 'media'} 
                  onClick={() => setActiveTab('media')} 
                  label="Settings"
                  icon={<SettingsIcon size={16} />} 
                />
              </div>
            </div>

            {/* Tab Content */}
            <div className="min-h-[400px]">
              {activeTab === 'general' && (
                <div className="space-y-6">
                  <div className="bg-white rounded-lg border border-bored-gray-200 p-6">
                    <h3 className="text-lg font-bold text-bored-gray-900 mb-4">Experience Page</h3>
                    <p className="text-sm text-bored-gray-500 mb-6">Add photos, summary, and meeting details</p>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-bored-gray-700 mb-2">Title</label>
                        <input
                          type="text"
                          value={selectedExperience.title}
                          className="w-full px-4 py-2 border border-bored-gray-200 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-bored-gray-700 mb-2">Description</label>
                        <textarea
                          rows={8}
                          className="w-full px-4 py-2 border border-bored-gray-200 rounded-lg"
                          placeholder="What will you do..."
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'calendar' && (
                <div className="bg-white rounded-lg border border-bored-gray-200 p-6">
                  <h3 className="text-lg font-bold text-bored-gray-900 mb-4">Dates & Prices</h3>
                  <p className="text-sm text-bored-gray-500">Control dates on which your experience is selling, bookable units and prices.</p>
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="bg-white rounded-lg border border-bored-gray-200 p-6">
                  <h3 className="text-lg font-bold text-bored-gray-900 mb-4">Translations</h3>
                  <p className="text-sm text-bored-gray-500">Translate your experience to multiple languages</p>
                </div>
              )}

              {activeTab === 'media' && (
                <div className="bg-white rounded-lg border border-bored-gray-200 p-6">
                  <h3 className="text-lg font-bold text-bored-gray-900 mb-4">Settings</h3>
                  <p className="text-sm text-bored-gray-500">Configure experience settings</p>
                </div>
              )}
            </div>
          </div>
        );
      }

      // LIST MODE - Show all experiences in category
      return (
        <ExperienceList 
          experiences={experiences}
          category={categoryName}
          onExperienceClick={handleExperienceClick}
        />
      );
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

const TabButton = ({ active, onClick, label, icon }: { active: boolean, onClick: () => void, label: string, icon: React.ReactNode }) => (
  <button
    onClick={onClick}
    className={`pb-3 flex items-center gap-2 text-sm font-medium transition-all duration-200 border-b-2
      ${active 
        ? 'border-bored-neon text-bored-black' 
        : 'border-transparent text-bored-gray-500 hover:text-bored-gray-900 hover:border-bored-gray-300'
      }`}
  >
    {icon}
    {label}
  </button>
);

export default App;