import React from 'react';
import { MapPin, ChevronRight, LogOut, Building2 } from 'lucide-react';
import { useAuth, type AccessibleHotel } from '../../lib/authContext';

// ─── Hero photo per hotel (Editory collection) ────────────────────────────────
const HOTEL_PHOTOS: Record<string, string> = {
  'editory-flor-de-sal-viana':
    'https://www.editoryhotels.com/media/mbdajquj/4i6a2821.jpg',
  'editory-porto-palacio':
    'https://www.editoryhotels.com/media/ublaj0lb/porto_palacio-122.jpg',
  'editory-artist-baixa-porto':
    'https://www.editoryhotels.com/media/me4hmhyr/artist0301_1.jpg',
  'editory-house-ribeira-porto':
    'https://www.editoryhotels.com/media/wcwjqexf/647a6347.jpg',
  'editory-boulevard-aliados-porto':
    'https://www.editoryhotels.com/media/dhjmai14/boulevard0103.jpg',
  'editory-garden-baixa-porto':
    'https://www.editoryhotels.com/media/pwoch2lx/647a5843.jpg',
  'editory-riverside-lisboa':
    'https://www.editoryhotels.com/media/lv1dmvup/riverside_lifetyle-51.jpg',
  'editory-aqualuz-lagos':
    'https://www.editoryhotels.com/media/leqfmfxd/img_2804.jpg',
  'editory-by-the-sea-lagos':
    'https://www.editoryhotels.com/media/q11lmhh4/edbts_0008.jpg',
  'editory-residence-lagos':
    'https://www.editoryhotels.com/media/emripvfk/7.jpg',
  'editory-ocean-way-funchal':
    'https://www.editoryhotels.com/media/xzudzlvf/editory_ocean_way_rooftop_17122025_0213.jpg',
  'editory-garden-carmo-funchal':
    'https://www.editoryhotels.com/media/ladhn3a2/teg_balcony-double-10.jpg',
};

// ─── Destination priority order ───────────────────────────────────────────────
const LOCATION_ORDER = ['Viana do Castelo', 'Porto', 'Lisboa', 'Lagos', 'Funchal'];

function locationRank(loc: string): number {
  const i = LOCATION_ORDER.findIndex(l =>
    loc.toLowerCase().includes(l.toLowerCase())
  );
  return i === -1 ? 99 : i;
}

// ─── Group hotels by location ─────────────────────────────────────────────────
function groupByLocation(hotels: AccessibleHotel[]): [string, AccessibleHotel[]][] {
  const map: Record<string, AccessibleHotel[]> = {};
  for (const h of hotels) {
    const loc = h.location || 'Other';
    if (!map[loc]) map[loc] = [];
    map[loc].push(h);
  }
  return Object.entries(map).sort(([a], [b]) => locationRank(a) - locationRank(b));
}

// ─── Main component ───────────────────────────────────────────────────────────
export function HotelSelector() {
  const { hotels, profile, setActiveHotelId, signOut } = useAuth();
  const grouped = groupByLocation(hotels);

  return (
    <div className="min-h-screen bg-bored-gray-50 flex flex-col items-center py-10 px-4">

      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-bored-black mb-4">
          <span className="text-bored-neon font-bold text-xl tracking-tighter">b.</span>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-bored-black">
          Choose a property
        </h1>
        <p className="text-sm text-bored-gray-400 mt-1">
          Signed in as{' '}
          <span className="font-medium text-bored-gray-600">{profile?.email}</span>
        </p>
      </div>

      {/* Destination sections */}
      <div className="w-full max-w-2xl space-y-4">
        {grouped.map(([location, locationHotels]) => (
          <DestinationSection
            key={location}
            location={location}
            hotels={locationHotels}
            onSelect={setActiveHotelId}
          />
        ))}
      </div>

      {/* Sign out */}
      <button
        onClick={signOut}
        className="mt-8 flex items-center gap-2 text-sm text-bored-gray-400 hover:text-bored-black transition-colors"
      >
        <LogOut size={14} /> Sign out
      </button>
    </div>
  );
}

// ─── Destination section ──────────────────────────────────────────────────────
function DestinationSection({
  location,
  hotels,
  onSelect,
}: {
  key?: React.Key;
  location: string;
  hotels: AccessibleHotel[];
  onSelect: (id: string) => void;
}) {
  return (
    <div className="bg-white rounded-2xl border border-bored-gray-100 overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.04)]">

      {/* Destination header */}
      <div className="px-5 py-3.5 border-b border-bored-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin size={11} className="text-bored-gray-400 flex-shrink-0" />
          <span className="text-[11px] font-semibold text-bored-gray-500 uppercase tracking-wider">
            {location}
          </span>
        </div>
        <span className="text-[10px] text-bored-gray-300 tabular-nums">
          {hotels.length} {hotels.length === 1 ? 'hotel' : 'hotels'}
        </span>
      </div>

      {/* Hotel rows */}
      {hotels.map((hotel, idx) => (
        <HotelRow key={hotel.id} hotel={hotel} onSelect={onSelect} isFirst={idx === 0} />
      ))}
    </div>
  );
}

// ─── Hotel row ────────────────────────────────────────────────────────────────
function HotelRow({
  hotel,
  onSelect,
  isFirst,
}: {
  key?: React.Key;
  hotel: AccessibleHotel;
  onSelect: (id: string) => void;
  isFirst: boolean;
}) {
  const baseUrl = HOTEL_PHOTOS[hotel.id];
  // Use Umbraco image processor for a crisp 3:2 thumbnail
  const thumbUrl = baseUrl
    ? `${baseUrl}?anchor=center&mode=crop&width=160&height=106`
    : null;

  return (
    <button
      onClick={() => onSelect(hotel.id)}
      className={`w-full flex items-center gap-4 px-5 py-3.5 hover:bg-bored-gray-50 transition-colors group ${
        isFirst ? '' : 'border-t border-bored-gray-50'
      }`}
    >
      {/* Photo thumbnail */}
      <div className="w-[72px] h-[48px] rounded-lg flex-shrink-0 overflow-hidden bg-bored-gray-100">
        {thumbUrl ? (
          <img
            src={thumbUrl}
            alt={hotel.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : hotel.logo_url ? (
          <img
            src={hotel.logo_url}
            alt={hotel.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Building2 size={18} className="text-bored-gray-300" />
          </div>
        )}
      </div>

      {/* Name + group */}
      <div className="flex-1 text-left min-w-0">
        <p className="text-sm font-medium text-bored-black leading-snug truncate">
          {hotel.name}
        </p>
        {hotel.group_name && (
          <p className="text-[11px] text-bored-gray-400 mt-0.5 truncate">
            {hotel.group_name}
          </p>
        )}
      </div>

      {/* Chevron */}
      <ChevronRight
        size={14}
        className="text-bored-gray-300 group-hover:text-bored-gray-600 flex-shrink-0 transition-colors"
      />
    </button>
  );
}
