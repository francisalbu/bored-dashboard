import React from 'react';
import { 
  LayoutDashboard, 
  CalendarDays, 
  Package, 
  DollarSign, 
  ChevronDown,
  Star,
  BarChart3,
  Users,
  Calendar as CalendarIcon,
  Globe
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate }) => {
  return (
    <div className="w-64 h-screen bg-white/90 backdrop-blur-xl border-r border-bored-gray-200 flex flex-col fixed left-0 top-0 z-50 shadow-sm">
      {/* Logo Area */}
      <div className="p-8 border-b border-bored-gray-100">
        <h1 className="text-2xl font-light tracking-tight text-bored-black">Bored<span className="font-semibold">.</span></h1>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
        
        <NavItem 
          icon={<LayoutDashboard size={20} />} 
          label="Home" 
          active={currentView === 'home'}
          onClick={() => onNavigate('home')}
        />

        <NavItem 
          icon={<Star size={20} />} 
          label="Reviews" 
          active={currentView === 'reviews'}
          onClick={() => onNavigate('reviews')}
        />
        
        <NavItem 
          icon={<BarChart3 size={20} />} 
          label="Analytics" 
          active={currentView === 'analytics'}
          onClick={() => onNavigate('analytics')}
        />

        <NavItem 
          icon={<CalendarDays size={20} />} 
          label="Bookings" 
          active={currentView === 'bookings'}
          onClick={() => onNavigate('bookings')}
        />

        <NavItem 
          icon={<DollarSign size={20} />} 
          label="Earnings" 
          active={currentView === 'earnings'}
          onClick={() => onNavigate('earnings')}
        />

        {/* SELLING SECTION */}
        <div className="pt-6 pb-2">
           <div className="px-4 mb-3">
            <h4 className="text-xs font-semibold text-bored-gray-400 uppercase tracking-wider">Selling</h4>
           </div>
           
           <NavItem 
            icon={<Package size={18} />} 
            label="Catalog" 
            active={['activities', 'spa', 'rentals', 'packages'].includes(currentView)} 
            onClick={() => onNavigate('activities')} // Default to activities
          />
          
          {/* Submenu for Catalog */}
          <div className="ml-10 mt-2 space-y-1 border-l border-bored-gray-200 pl-4 mb-2">
            <SubNavItem label="Hotel Activities" active={currentView === 'activities'} onClick={() => onNavigate('activities')} />
            <SubNavItem label="Spa & Wellness" active={currentView === 'spa'} onClick={() => onNavigate('spa')} />
            <SubNavItem label="Rentals" active={currentView === 'rentals'} onClick={() => onNavigate('rentals')} />
            <SubNavItem label="Packages" active={currentView === 'packages'} onClick={() => onNavigate('packages')} />
          </div>
        </div>

        {/* ORGANISING SECTION */}
        <div className="pt-2 pb-2">
           <div className="px-4 mb-3">
            <h4 className="text-xs font-semibold text-bored-gray-400 uppercase tracking-wider">Organising</h4>
           </div>
           
           <NavItem 
            icon={<CalendarIcon size={18} />} 
            label="Calendar" 
            active={currentView === 'calendar_view'}
            onClick={() => onNavigate('calendar_view')}
          />
          
          <NavItem 
            icon={<Users size={18} />} 
            label="Guests" 
            active={currentView === 'guests'}
            onClick={() => onNavigate('guests')}
          />
        </div>

        {/* ACCOUNT SECTION */}
        <div className="pt-4">
           <div className="px-4 mb-3">
            <h4 className="text-xs font-semibold text-bored-gray-400 uppercase tracking-wider">Account</h4>
           </div>
          <NavItem 
            icon={<Globe size={18} />} 
            label="Site Settings" 
            active={currentView === 'site_settings'}
            onClick={() => onNavigate('site_settings')}
          />
        </div>

      </nav>

      {/* User Profile Snippet */}
      <div className="p-6 border-t border-bored-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-bored-neon to-yellow-300 flex items-center justify-center text-sm font-semibold text-bored-black">
            JD
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-bored-black">John Doe</p>
            <p className="text-xs text-bored-gray-500">Hotel Manager</p>
          </div>
          <ChevronDown size={16} className="text-bored-gray-400" />
        </div>
      </div>
    </div>
  );
};

const NavItem = ({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 
      ${active 
        ? 'bg-bored-black text-white shadow-sm' 
        : 'text-bored-gray-600 hover:bg-bored-gray-50 hover:text-bored-black'
      }`}
  >
    <span className={active ? 'text-white' : 'text-bored-gray-400'}>{icon}</span>
    {label}
  </button>
);

const SubNavItem = ({ label, active, onClick }: { label: string, active?: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-all duration-200
      ${active 
        ? 'text-bored-black font-medium bg-bored-neon/10' 
        : 'text-bored-gray-500 hover:text-bored-black hover:bg-bored-gray-50'
      }`}
  >
    {label}
  </button>
);