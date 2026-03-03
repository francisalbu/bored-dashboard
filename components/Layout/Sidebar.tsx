import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  CalendarDays, 
  Package, 
  DollarSign, 
  Star,
  BarChart3,
  Users,
  Calendar as CalendarIcon,
  Globe,
  LogOut,
  Building2,
  ChevronDown,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { useAuth } from '../../lib/authContext';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate }) => {
  const { profile, hotels, activeHotelId, setActiveHotelId, signOut } = useAuth();
  const [hotelPickerOpen, setHotelPickerOpen] = useState(false);

  const activeHotel = hotels.find(h => h.id === activeHotelId);
  const initials = profile?.full_name
    ? profile.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : profile?.email?.slice(0, 2).toUpperCase() || '?';

  // Group hotels by group_name for the picker
  const groupedHotels = hotels.reduce<Record<string, typeof hotels>>((acc, h) => {
    const key = h.group_name || '—';
    if (!acc[key]) acc[key] = [];
    acc[key].push(h);
    return acc;
  }, {});

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
          {profile?.role === 'super_admin' && (
            <NavItem
              icon={<ShieldCheck size={18} />}
              label="Admin Panel"
              active={currentView === 'admin'}
              onClick={() => onNavigate('admin')}
            />
          )}
        </div>

      </nav>

      {/* Hotel switcher + user profile */}
      <div className="p-4 border-t border-bored-gray-100 space-y-2">

        {/* Hotel picker button */}
        {hotels.length > 0 && (
          <div className="relative">
            <button
              onClick={() => hotels.length > 1 && setHotelPickerOpen(o => !o)}
              className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl border transition-all ${
                hotelPickerOpen
                  ? 'bg-bored-gray-100 border-bored-gray-300'
                  : 'bg-bored-gray-50 border-bored-gray-100 hover:bg-bored-gray-100 hover:border-bored-gray-200'
              } ${hotels.length === 1 ? 'cursor-default' : 'cursor-pointer'}`}
            >
              {/* Hotel logo or icon */}
              {activeHotel?.logo_url ? (
                <img src={activeHotel.logo_url} alt="" className="w-6 h-6 rounded-md object-cover flex-shrink-0" />
              ) : (
                <div className="w-6 h-6 rounded-md bg-bored-gray-200 flex items-center justify-center flex-shrink-0">
                  <Building2 size={11} className="text-bored-gray-500" />
                </div>
              )}
              <div className="flex-1 min-w-0 text-left">
                <p className="text-[11px] font-semibold text-bored-black truncate leading-tight">
                  {activeHotel?.name ?? 'No hotel selected'}
                </p>
                {activeHotel?.group_name && (
                  <p className="text-[9px] text-bored-gray-400 truncate leading-tight">{activeHotel.group_name}</p>
                )}
              </div>
              {hotels.length > 1 && (
                <ChevronDown
                  size={13}
                  className={`text-bored-gray-400 flex-shrink-0 transition-transform duration-200 ${hotelPickerOpen ? 'rotate-180' : ''}`}
                />
              )}
            </button>

            {/* Dropdown */}
            {hotelPickerOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-2xl border border-bored-gray-200 shadow-xl overflow-hidden z-50">
                <div className="px-3 pt-3 pb-1">
                  <p className="text-[10px] font-semibold text-bored-gray-400 uppercase tracking-wider">Switch workspace</p>
                </div>
                <div className="max-h-64 overflow-y-auto pb-2">
                  {Object.entries(groupedHotels).map(([groupName, groupHotels]) => (
                    <div key={groupName}>
                      {Object.keys(groupedHotels).length > 1 && (
                        <p className="px-3 pt-2 pb-1 text-[9px] font-semibold text-bored-gray-400 uppercase tracking-wider">
                          {groupName}
                        </p>
                      )}
                      {groupHotels.map(hotel => (
                        <button
                          key={hotel.id}
                          onClick={() => { setActiveHotelId(hotel.id); setHotelPickerOpen(false); }}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                            hotel.id === activeHotelId
                              ? 'bg-bored-gray-50'
                              : 'hover:bg-bored-gray-50'
                          }`}
                        >
                          {hotel.logo_url ? (
                            <img src={hotel.logo_url} alt="" className="w-7 h-7 rounded-lg object-cover flex-shrink-0" />
                          ) : (
                            <div className="w-7 h-7 rounded-lg bg-bored-gray-100 flex items-center justify-center flex-shrink-0">
                              <Building2 size={12} className="text-bored-gray-400" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-bored-black truncate">{hotel.name}</p>
                            {hotel.location && (
                              <p className="text-[9px] text-bored-gray-400 truncate">{hotel.location}</p>
                            )}
                          </div>
                          {hotel.id === activeHotelId && (
                            <Check size={13} className="text-bored-black flex-shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* User row */}
        <div className="flex items-center gap-3 px-1">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-bored-neon to-yellow-300 flex items-center justify-center text-xs font-semibold text-bored-black flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-bored-black truncate">
              {profile?.full_name || profile?.email || 'User'}
            </p>
            <p className="text-[10px] text-bored-gray-400 capitalize">{profile?.role?.replace('_', ' ')}</p>
          </div>
          <button
            onClick={signOut}
            className="p-1.5 rounded-lg text-bored-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
            title="Sign out"
          >
            <LogOut size={13} />
          </button>
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