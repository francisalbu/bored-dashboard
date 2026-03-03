import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  ChevronRight,
  Search,
  Plus,
  Eye,
  EyeOff,
  MapPin,
  Clock,
  Users,
  Star,
  Globe,
  Loader2,
  Trash2,
  ArrowLeft,
  CheckCircle,
  Zap,
  Shield,
  Image as ImageIcon,
  ChevronDown,
  ChevronUp,
  X,
  Pen,
  Lock,
  Package,
  Play,
  Camera,
  Check,
  Upload,
  Film,
  GripVertical,
  Sparkles,
  FileText,
  Share2,
  ExternalLink,
} from 'lucide-react';
import {
  ExperienceRow,
  ExperienceInsert,
  BLANK_EXPERIENCE,
  fetchAllExperiences,
  fetchExperiencesByCategory,
  fetchHotelCatalogIds,
  addExperienceToHotelCatalog,
  removeExperienceFromHotelCatalog,
  createExperience,
  updateExperience,
  deleteExperience,
  toggleExperienceActive,
} from '../../lib/experienceService';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/authContext';
import { BulkUploadModal } from './BulkUploadModal';
import { ViatorImportModal } from './ViatorImportModal';
import { generateExperienceFields } from '../../lib/aiDescriptionService';

// ─────────────────────────────────────────────────────────────────────────────
// operator_id for demo mock data — replaced by the auth-derived id at runtime
const DEMO_OPERATOR_ID = 39;

// Map catalog section names to Supabase category values
const SECTION_TO_CATEGORY: Record<string, string> = {
  spa: 'Spa & Wellness',
  rentals: 'Rentals',
  packages: 'Packages',
};

const CATEGORY_OPTIONS = [
  'Outdoors', 'Sports', 'Culture Dive', 'Night Explorer',
  'Mind & Body', 'Local Cooking', 'Learn & Create', 'Micro Adventures', 'Time Stories',
];
const CURRENCY_OPTIONS = ['EUR', 'USD', 'GBP'];
const LANGUAGE_OPTIONS = ['English', 'Portuguese', 'Spanish', 'French', 'German', 'Italian', 'Dutch', 'Japanese', 'Chinese', 'Arabic'];

const now = new Date().toISOString();

// ─── Hotel Mock Catalog ──────────────────────────────────────────────────────
const HOTEL_SPA: ExperienceRow[] = [
  { id: 90001, operator_id: DEMO_OPERATOR_ID, title: 'Satsanga Relaxing Massage', description: 'A deeply relaxing full-body massage using warm essential oils. Our therapists use long, flowing strokes to release tension and promote total relaxation.', short_description: 'Full-body relaxation massage with warm essential oils', location: 'Satsanga Spa & Wellness', address: 'Vila Galé Lagos, Meia Praia, Lagos', meeting_point: 'Spa Reception, Floor -1', latitude: 37.1, longitude: -8.67, distance: null, city: 'Lagos', price: 75, currency: 'EUR', duration: '50min', max_group_size: 1, category: 'Spa & Wellness', tags: ['Massage', 'Relaxation', 'Wellness'], video_url: null, image_url: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80', images: ['https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80', 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=800&q=80'], provider_logo: null, highlights: ['50-minute session', 'Warm essential oils', 'Professional therapist', 'Deep relaxation technique'], included: ['Robe & slippers', 'Herbal tea after treatment', 'Access to thermal circuit'], what_to_bring: null, languages: ['Portuguese', 'English', 'Spanish'], cancellation_policy: 'Free cancellation up to 4 hours before', important_info: 'Arrive 15 minutes before your appointment.', instant_booking: true, available_today: true, verified: true, is_active: true, rating: 4.8, review_count: 124, view_count: 890, display_order: 1, created_at: now, updated_at: now },
  { id: 90002, operator_id: DEMO_OPERATOR_ID, title: 'Hot Stone Therapy', description: 'Heated basalt stones placed on key energy points and used as massage tools to melt away deep muscle tension.', short_description: 'Deep therapeutic massage with heated basalt stones', location: 'Satsanga Spa & Wellness', address: 'Vila Galé Lagos, Meia Praia, Lagos', meeting_point: 'Spa Reception, Floor -1', latitude: 37.1, longitude: -8.67, distance: null, city: 'Lagos', price: 95, currency: 'EUR', duration: '60min', max_group_size: 1, category: 'Spa & Wellness', tags: ['Hot Stones', 'Deep Tissue', 'Therapy'], video_url: null, image_url: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=800&q=80', images: ['https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=800&q=80'], provider_logo: null, highlights: ['60-minute treatment', 'Heated basalt stones', 'Targets deep muscle tension', 'Improves circulation'], included: ['Robe & slippers', 'Herbal tea', 'Thermal circuit access'], what_to_bring: null, languages: ['Portuguese', 'English'], cancellation_policy: 'Free cancellation up to 4 hours before', important_info: 'Not recommended during pregnancy.', instant_booking: true, available_today: true, verified: true, is_active: true, rating: 4.9, review_count: 87, view_count: 620, display_order: 2, created_at: now, updated_at: now },
  { id: 90003, operator_id: DEMO_OPERATOR_ID, title: 'Couples Ritual — Algarve Sunset', description: 'A romantic spa experience for two. Begin with a private thermal circuit, followed by a side-by-side full-body massage, and finish with sparkling wine.', short_description: 'Romantic spa experience for two with massage & sparkling wine', location: 'Satsanga Spa & Wellness', address: 'Vila Galé Lagos, Meia Praia, Lagos', meeting_point: 'Spa Reception, Floor -1', latitude: 37.1, longitude: -8.67, distance: null, city: 'Lagos', price: 190, currency: 'EUR', duration: '1h30', max_group_size: 2, category: 'Spa & Wellness', tags: ['Couples', 'Romantic', 'Premium'], video_url: null, image_url: 'https://images.unsplash.com/photo-1540555700478-4be289fbec6f?w=800&q=80', images: ['https://images.unsplash.com/photo-1540555700478-4be289fbec6f?w=800&q=80', 'https://images.unsplash.com/photo-1596178060810-72f53ce9a65c?w=800&q=80'], provider_logo: null, highlights: ['90-minute experience', 'Private suite for two', 'Side-by-side massage', 'Sparkling wine & fruit'], included: ['Private thermal circuit', 'Full-body massage x2', 'Sparkling wine & fruit', 'Robes & slippers'], what_to_bring: null, languages: ['Portuguese', 'English', 'French'], cancellation_policy: 'Free cancellation up to 24 hours before', important_info: 'Please book at least 24 hours in advance.', instant_booking: false, available_today: false, verified: true, is_active: true, rating: 4.9, review_count: 56, view_count: 1200, display_order: 3, created_at: now, updated_at: now },
  { id: 90004, operator_id: DEMO_OPERATOR_ID, title: 'Hydra-Glow Facial Treatment', description: 'A rejuvenating facial using marine collagen and hyaluronic acid serums.', short_description: 'Rejuvenating facial with marine collagen & hyaluronic acid', location: 'Satsanga Spa & Wellness', address: 'Vila Galé Lagos', meeting_point: 'Spa Reception, Floor -1', latitude: 37.1, longitude: -8.67, distance: null, city: 'Lagos', price: 65, currency: 'EUR', duration: '45min', max_group_size: 1, category: 'Spa & Wellness', tags: ['Facial', 'Skincare'], video_url: null, image_url: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&q=80', images: ['https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&q=80'], provider_logo: null, highlights: ['45-minute treatment', 'Marine collagen serums', 'Deep cleansing'], included: ['Skin analysis', 'Full treatment'], what_to_bring: null, languages: ['Portuguese', 'English'], cancellation_policy: 'Free cancellation up to 4 hours before', important_info: 'Please arrive without makeup.', instant_booking: true, available_today: true, verified: true, is_active: true, rating: 4.7, review_count: 43, view_count: 340, display_order: 4, created_at: now, updated_at: now },
  { id: 90005, operator_id: DEMO_OPERATOR_ID, title: 'Thermal Circuit — Day Pass', description: 'Full access to heated pool, sauna, Turkish bath, jacuzzi, experience showers, and ice fountain.', short_description: 'Full-day access to heated pool, sauna, Turkish bath & jacuzzi', location: 'Satsanga Spa & Wellness', address: 'Vila Galé Lagos', meeting_point: 'Spa Reception, Floor -1', latitude: 37.1, longitude: -8.67, distance: null, city: 'Lagos', price: 25, currency: 'EUR', duration: '3h', max_group_size: null, category: 'Spa & Wellness', tags: ['Thermal', 'Sauna', 'Pool'], video_url: null, image_url: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800&q=80', images: ['https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800&q=80'], provider_logo: null, highlights: ['3-hour access', 'Heated indoor pool', 'Sauna & Turkish bath', 'Jacuzzi'], included: ['Robe & slippers', 'Towel', 'Locker'], what_to_bring: ['Swimsuit'], languages: ['Portuguese', 'English', 'Spanish', 'French', 'German'], cancellation_policy: 'Free cancellation up to 2 hours before', important_info: 'Swimsuit required. Children under 16 not allowed.', instant_booking: true, available_today: true, verified: true, is_active: true, rating: 4.6, review_count: 312, view_count: 2100, display_order: 5, created_at: now, updated_at: now },
  { id: 90006, operator_id: DEMO_OPERATOR_ID, title: 'Ayurvedic Abhyanga Massage', description: 'Traditional Ayurvedic warm oil massage using synchronized two-hand technique.', short_description: 'Traditional warm oil Ayurvedic full-body massage', location: 'Satsanga Spa & Wellness', address: 'Vila Galé Lagos', meeting_point: 'Spa Reception, Floor -1', latitude: 37.1, longitude: -8.67, distance: null, city: 'Lagos', price: 85, currency: 'EUR', duration: '55min', max_group_size: 1, category: 'Spa & Wellness', tags: ['Ayurveda', 'Massage'], video_url: null, image_url: 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=800&q=80', images: ['https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=800&q=80'], provider_logo: null, highlights: ['55-minute session', 'Warm Ayurvedic oils', 'Synchronized technique'], included: ['Robe & slippers', 'Herbal tea', 'Thermal circuit access'], what_to_bring: null, languages: ['Portuguese', 'English'], cancellation_policy: 'Free cancellation up to 4 hours before', important_info: 'Oil-based treatment.', instant_booking: true, available_today: true, verified: true, is_active: true, rating: 4.8, review_count: 67, view_count: 450, display_order: 6, created_at: now, updated_at: now },
];

const HOTEL_RENTALS: ExperienceRow[] = [
  { id: 91001, operator_id: DEMO_OPERATOR_ID, title: 'Beach Umbrella & Sunbeds', description: 'Reserve your spot on Meia Praia beach with a premium umbrella and two comfortable sunbeds.', short_description: 'Premium umbrella + 2 sunbeds on Meia Praia', location: 'Meia Praia Beach', address: 'Praia da Meia Praia, Lagos', meeting_point: 'Beach Club entrance', latitude: 37.1, longitude: -8.67, distance: null, city: 'Lagos', price: 25, currency: 'EUR', duration: 'Full day', max_group_size: 2, category: 'Rentals', tags: ['Beach', 'Sunbeds'], video_url: null, image_url: '', images: ['https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80'], provider_logo: null, highlights: ['Full-day rental', 'Premium location', 'Towel service'], included: ['Umbrella', '2 sunbeds', 'Beach towels'], what_to_bring: ['Sunscreen'], languages: ['Portuguese', 'English'], cancellation_policy: 'Free cancellation up to 2 hours before', important_info: 'Subject to availability.', instant_booking: true, available_today: true, verified: true, is_active: true, rating: 4.5, review_count: 89, view_count: 600, display_order: 1, created_at: now, updated_at: now },
  { id: 91002, operator_id: DEMO_OPERATOR_ID, title: 'E-Bike Rental', description: 'Explore Lagos and the Algarve coast on our premium electric bikes. GPS included.', short_description: 'Electric bike with GPS and suggested coastal routes', location: 'Hotel Lobby', address: 'Vila Galé Lagos', meeting_point: 'Concierge Desk', latitude: 37.1, longitude: -8.67, distance: null, city: 'Lagos', price: 35, currency: 'EUR', duration: '4h', max_group_size: 1, category: 'Rentals', tags: ['E-Bike', 'Cycling'], video_url: null, image_url: '', images: ['https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800&q=80'], provider_logo: null, highlights: ['4-hour rental', 'GPS with routes', 'Helmet included'], included: ['E-bike', 'Helmet', 'GPS', 'Lock'], what_to_bring: ['Comfortable clothing'], languages: ['Portuguese', 'English'], cancellation_policy: 'Free cancellation up to 2 hours before', important_info: 'Must be 16+.', instant_booking: true, available_today: true, verified: true, is_active: true, rating: 4.7, review_count: 45, view_count: 380, display_order: 2, created_at: now, updated_at: now },
  { id: 91003, operator_id: DEMO_OPERATOR_ID, title: 'Stand-Up Paddleboard', description: 'Rent a premium SUP board and explore the crystal-clear waters of the Algarve coast.', short_description: 'SUP board rental along the Algarve coastline', location: 'Meia Praia Beach', address: 'Beach Club, Meia Praia', meeting_point: 'Beach Club Water Sports', latitude: 37.1, longitude: -8.67, distance: null, city: 'Lagos', price: 20, currency: 'EUR', duration: '2h', max_group_size: 1, category: 'Rentals', tags: ['SUP', 'Water Sports'], video_url: null, image_url: '', images: ['https://images.unsplash.com/photo-1526188717906-ab4a2f949f48?w=800&q=80'], provider_logo: null, highlights: ['2-hour rental', 'Premium board', 'Life jacket included'], included: ['SUP board', 'Paddle', 'Life jacket'], what_to_bring: ['Swimsuit', 'Sunscreen'], languages: ['Portuguese', 'English'], cancellation_policy: 'Free cancellation up to 1 hour before', important_info: 'Weather dependent.', instant_booking: true, available_today: true, verified: true, is_active: true, rating: 4.6, review_count: 32, view_count: 280, display_order: 3, created_at: now, updated_at: now },
];

const HOTEL_PACKAGES: ExperienceRow[] = [
  { id: 94001, operator_id: DEMO_OPERATOR_ID, title: 'Romantic Getaway Package', description: 'The perfect romantic escape: 2-night stay in a sea-view suite, couples spa ritual, private beach dinner, and champagne on arrival.', short_description: '2 nights + couples spa + beach dinner + champagne', location: 'Vila Galé Lagos', address: 'Vila Galé Lagos, Meia Praia', meeting_point: 'Hotel Reception', latitude: 37.1, longitude: -8.67, distance: null, city: 'Lagos', price: 450, currency: 'EUR', duration: '2 nights', max_group_size: 2, category: 'Packages', tags: ['Romantic', 'Couples', 'Premium'], video_url: null, image_url: '', images: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80'], provider_logo: null, highlights: ['2-night sea-view suite', 'Couples spa ritual', 'Private beach dinner', 'Champagne on arrival'], included: ['Accommodation', 'Couples spa', 'Beach dinner', 'Champagne', 'Breakfast'], what_to_bring: null, languages: ['Portuguese', 'English'], cancellation_policy: 'Free cancellation up to 7 days before', important_info: 'Subject to availability.', instant_booking: false, available_today: false, verified: true, is_active: true, rating: 4.9, review_count: 34, view_count: 1200, display_order: 1, created_at: now, updated_at: now },
  { id: 94002, operator_id: DEMO_OPERATOR_ID, title: 'Adventure Week Package', description: 'A week of experiences: 5-night stay, daily breakfast, 3 activities, airport transfers, and a welcome drink.', short_description: '5 nights + 3 activities + transfers + breakfast', location: 'Vila Galé Lagos', address: 'Vila Galé Lagos, Meia Praia', meeting_point: 'Hotel Reception', latitude: 37.1, longitude: -8.67, distance: null, city: 'Lagos', price: 890, currency: 'EUR', duration: '5 nights', max_group_size: 2, category: 'Packages', tags: ['Adventure', 'Activities', 'Week'], video_url: null, image_url: '', images: ['https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80'], provider_logo: null, highlights: ['5-night stay', '3 activities included', 'Airport transfers', 'Daily breakfast'], included: ['Accommodation', '3 activities', 'Airport transfers', 'Breakfast', 'Welcome drink'], what_to_bring: null, languages: ['Portuguese', 'English'], cancellation_policy: 'Free cancellation up to 14 days before', important_info: 'Activities subject to availability.', instant_booking: false, available_today: false, verified: true, is_active: true, rating: 4.8, review_count: 18, view_count: 780, display_order: 2, created_at: now, updated_at: now },
  { id: 94003, operator_id: DEMO_OPERATOR_ID, title: 'Wellness Retreat — 3 Days', description: 'A 3-day wellness immersion: daily yoga, 2 spa treatments, thermal circuit, healthy breakfast, and nutrition consultation.', short_description: '3-day wellness immersion with yoga, spa & nutrition', location: 'Vila Galé Lagos', address: 'Vila Galé Lagos, Meia Praia', meeting_point: 'Spa Reception', latitude: 37.1, longitude: -8.67, distance: null, city: 'Lagos', price: 380, currency: 'EUR', duration: '3 days', max_group_size: 1, category: 'Packages', tags: ['Wellness', 'Yoga', 'Spa'], video_url: null, image_url: '', images: ['https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800&q=80'], provider_logo: null, highlights: ['Daily yoga sessions', '2 spa treatments', 'Thermal circuit', 'Healthy breakfast'], included: ['Accommodation', 'Yoga sessions', 'Spa treatments', 'Thermal circuit', 'Breakfast'], what_to_bring: ['Comfortable yoga clothing'], languages: ['Portuguese', 'English'], cancellation_policy: 'Free cancellation up to 7 days before', important_info: 'Yoga mats provided.', instant_booking: false, available_today: false, verified: true, is_active: true, rating: 4.9, review_count: 12, view_count: 450, display_order: 3, created_at: now, updated_at: now },
];

const HOTEL_CATALOG: Record<string, ExperienceRow[]> = {
  spa: HOTEL_SPA,
  rentals: HOTEL_RENTALS,
  packages: HOTEL_PACKAGES,
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmtCurrency = (c?: string) =>
  c === 'EUR' ? '€' : c === 'USD' ? '$' : c === 'GBP' ? '£' : c || '';

const SUPABASE_BUCKET = 'experience-media';
const SUPABASE_URL = 'https://hnivuisqktlrusyqywaz.supabase.co';

async function uploadFile(file: File): Promise<string | null> {
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from(SUPABASE_BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  });
  if (error) {
    console.error('Upload error:', error.message);
    return null;
  }
  return `${SUPABASE_URL}/storage/v1/object/public/${SUPABASE_BUCKET}/${path}`;
}

function isVideoUrl(url: string) {
  return /\.(mp4|mov|webm)$/i.test(url) || url.includes('video');
}

// ═══════════════════════════════════════════════════════════════════════════════
// MEDIA UPLOAD ZONE — drag & drop + click to browse + URL paste
// ═══════════════════════════════════════════════════════════════════════════════

function MediaSection({
  data,
  onChange,
}: {
  data: Partial<ExperienceRow>;
  onChange: (field: string, value: any) => void;
}) {
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [dragOver, setDragOver] = useState<string | null>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [dragGalleryIdx, setDragGalleryIdx] = useState<number | null>(null);

  const handleFiles = async (
    files: FileList | File[],
    target: 'cover' | 'video' | 'gallery'
  ) => {
    const fileArr = Array.from(files);
    if (fileArr.length === 0) return;

    setUploading((prev) => ({ ...prev, [target]: true }));

    if (target === 'cover') {
      const url = await uploadFile(fileArr[0]);
      if (url) onChange('image_url', url);
    } else if (target === 'video') {
      const url = await uploadFile(fileArr[0]);
      if (url) onChange('video_url', url);
    } else {
      const urls: string[] = [];
      for (const f of fileArr) {
        const url = await uploadFile(f);
        if (url) urls.push(url);
      }
      if (urls.length > 0) {
        onChange('images', [...(data.images || []), ...urls]);
      }
    }

    setUploading((prev) => ({ ...prev, [target]: false }));
  };

  const handleDrop = (e: React.DragEvent, target: 'cover' | 'video' | 'gallery') => {
    e.preventDefault();
    setDragOver(null);
    const files = e.dataTransfer.files;
    if (files.length > 0) handleFiles(files, target);
  };

  const handleDragOver = (e: React.DragEvent, target: string) => {
    e.preventDefault();
    setDragOver(target);
  };

  const handleGalleryReorder = (fromIdx: number, toIdx: number) => {
    if (fromIdx === toIdx) return;
    const imgs = [...(data.images || [])];
    const [moved] = imgs.splice(fromIdx, 1);
    imgs.splice(toIdx, 0, moved);
    onChange('images', imgs);
  };

  return (
    <div className="space-y-4">
      {/* Cover Image */}
      <div>
        <label className="block text-[11px] font-medium text-bored-gray-400 mb-1.5 uppercase tracking-wider">
          Cover Image
        </label>
        {data.image_url ? (
          <div className="relative group rounded-xl overflow-hidden h-40 bg-bored-gray-100">
            <img src={data.image_url} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
              <button
                onClick={() => coverInputRef.current?.click()}
                className="px-3 py-1.5 bg-white/90 rounded-lg text-[11px] font-medium text-bored-black hover:bg-white transition-colors"
              >
                Replace
              </button>
              <button
                onClick={() => onChange('image_url', '')}
                className="px-3 py-1.5 bg-white/90 rounded-lg text-[11px] font-medium text-red-600 hover:bg-white transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        ) : (
          <div
            onDrop={(e) => handleDrop(e, 'cover')}
            onDragOver={(e) => handleDragOver(e, 'cover')}
            onDragLeave={() => setDragOver(null)}
            onClick={() => coverInputRef.current?.click()}
            className={`relative h-40 rounded-xl border-2 border-dashed cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
              dragOver === 'cover'
                ? 'border-bored-black bg-bored-gray-50 scale-[1.01]'
                : 'border-bored-gray-200 bg-bored-gray-50/50 hover:border-bored-gray-300 hover:bg-bored-gray-50'
            }`}
          >
            {uploading.cover ? (
              <Loader2 size={20} className="text-bored-gray-400 animate-spin" />
            ) : (
              <>
                <div className="w-10 h-10 rounded-full bg-bored-gray-100 flex items-center justify-center">
                  <Upload size={16} className="text-bored-gray-400" />
                </div>
                <div className="text-center">
                  <p className="text-[12px] font-medium text-bored-gray-500">
                    Drop image here or <span className="text-bored-black underline">browse</span>
                  </p>
                  <p className="text-[10px] text-bored-gray-400 mt-0.5">
                    JPG, PNG or WebP · Max 50MB
                  </p>
                </div>
              </>
            )}
          </div>
        )}
        <input
          ref={coverInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={(e) => {
            if (e.target.files) handleFiles(e.target.files, 'cover');
            e.target.value = '';
          }}
        />
      </div>

      {/* Video */}
      <div>
        <label className="block text-[11px] font-medium text-bored-gray-400 mb-1.5 uppercase tracking-wider">
          Video
        </label>
        {data.video_url ? (
          <div className="relative group rounded-xl overflow-hidden h-32 bg-bored-black">
            <video
              src={data.video_url}
              className="w-full h-full object-cover"
              muted
              playsInline
              onMouseEnter={(e) => (e.target as HTMLVideoElement).play().catch(() => {})}
              onMouseLeave={(e) => { const v = e.target as HTMLVideoElement; v.pause(); v.currentTime = 0; }}
            />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Play size={16} className="text-white ml-0.5" />
              </div>
            </div>
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
              <button
                onClick={() => videoInputRef.current?.click()}
                className="px-3 py-1.5 bg-white/90 rounded-lg text-[11px] font-medium text-bored-black hover:bg-white transition-colors"
              >
                Replace
              </button>
              <button
                onClick={() => onChange('video_url', null)}
                className="px-3 py-1.5 bg-white/90 rounded-lg text-[11px] font-medium text-red-600 hover:bg-white transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        ) : (
          <div
            onDrop={(e) => handleDrop(e, 'video')}
            onDragOver={(e) => handleDragOver(e, 'video')}
            onDragLeave={() => setDragOver(null)}
            onClick={() => videoInputRef.current?.click()}
            className={`relative h-28 rounded-xl border-2 border-dashed cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
              dragOver === 'video'
                ? 'border-bored-black bg-bored-gray-50 scale-[1.01]'
                : 'border-bored-gray-200 bg-bored-gray-50/50 hover:border-bored-gray-300 hover:bg-bored-gray-50'
            }`}
          >
            {uploading.video ? (
              <Loader2 size={20} className="text-bored-gray-400 animate-spin" />
            ) : (
              <>
                <div className="w-10 h-10 rounded-full bg-bored-gray-100 flex items-center justify-center">
                  <Film size={16} className="text-bored-gray-400" />
                </div>
                <div className="text-center">
                  <p className="text-[12px] font-medium text-bored-gray-500">
                    Drop video here or <span className="text-bored-black underline">browse</span>
                  </p>
                  <p className="text-[10px] text-bored-gray-400 mt-0.5">
                    MP4, MOV or WebM · Max 50MB
                  </p>
                </div>
              </>
            )}
          </div>
        )}
        <input
          ref={videoInputRef}
          type="file"
          accept="video/mp4,video/quicktime,video/webm"
          className="hidden"
          onChange={(e) => {
            if (e.target.files) handleFiles(e.target.files, 'video');
            e.target.value = '';
          }}
        />
      </div>

      {/* Gallery */}
      <div>
        <label className="block text-[11px] font-medium text-bored-gray-400 mb-1.5 uppercase tracking-wider">
          Gallery {data.images && data.images.length > 0 && (
            <span className="text-bored-gray-300 font-normal">· {data.images.length} images</span>
          )}
        </label>

        {/* Existing gallery images — draggable grid */}
        {data.images && data.images.length > 0 && (
          <div className="grid grid-cols-4 gap-2 mb-2">
            {data.images.map((imgUrl, i) => (
              <div
                key={imgUrl + i}
                draggable
                onDragStart={() => setDragGalleryIdx(i)}
                onDragOver={(e) => { e.preventDefault(); }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (dragGalleryIdx !== null) {
                    handleGalleryReorder(dragGalleryIdx, i);
                    setDragGalleryIdx(null);
                  }
                }}
                className={`relative group/img aspect-square rounded-lg overflow-hidden bg-bored-gray-100 cursor-grab active:cursor-grabbing transition-all ${
                  dragGalleryIdx === i ? 'opacity-40 scale-95' : 'opacity-100'
                }`}
              >
                {isVideoUrl(imgUrl) ? (
                  <video src={imgUrl} className="w-full h-full object-cover" muted playsInline />
                ) : (
                  <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                )}
                {/* Order badge */}
                <div className="absolute top-1 left-1 w-5 h-5 rounded-md bg-black/60 flex items-center justify-center backdrop-blur-sm">
                  <span className="text-[9px] text-white font-medium">{i + 1}</span>
                </div>
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/40 transition-all flex items-center justify-center gap-1.5 opacity-0 group-hover/img:opacity-100">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onChange('images', data.images!.filter((_, j) => j !== i));
                    }}
                    className="w-7 h-7 rounded-lg bg-white/90 flex items-center justify-center hover:bg-white transition-colors"
                  >
                    <X size={12} className="text-red-600" />
                  </button>
                </div>
                {/* Drag handle hint */}
                <div className="absolute bottom-1 right-1 opacity-0 group-hover/img:opacity-60 transition-opacity">
                  <GripVertical size={10} className="text-white" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Drop zone for adding more */}
        <div
          onDrop={(e) => handleDrop(e, 'gallery')}
          onDragOver={(e) => handleDragOver(e, 'gallery')}
          onDragLeave={() => setDragOver(null)}
          onClick={() => galleryInputRef.current?.click()}
          className={`relative rounded-xl border-2 border-dashed cursor-pointer transition-all flex items-center justify-center gap-3 ${
            data.images && data.images.length > 0 ? 'h-20 py-3' : 'h-32 py-6 flex-col'
          } ${
            dragOver === 'gallery'
              ? 'border-bored-black bg-bored-gray-50 scale-[1.01]'
              : 'border-bored-gray-200 bg-bored-gray-50/50 hover:border-bored-gray-300 hover:bg-bored-gray-50'
          }`}
        >
          {uploading.gallery ? (
            <div className="flex items-center gap-2">
              <Loader2 size={16} className="text-bored-gray-400 animate-spin" />
              <span className="text-[11px] text-bored-gray-400">Uploading...</span>
            </div>
          ) : data.images && data.images.length > 0 ? (
            <div className="flex items-center gap-2">
              <Plus size={14} className="text-bored-gray-400" />
              <span className="text-[11px] font-medium text-bored-gray-500">
                Add more images
              </span>
            </div>
          ) : (
            <>
              <div className="w-10 h-10 rounded-full bg-bored-gray-100 flex items-center justify-center">
                <Camera size={16} className="text-bored-gray-400" />
              </div>
              <div className="text-center">
                <p className="text-[12px] font-medium text-bored-gray-500">
                  Drop images here or <span className="text-bored-black underline">browse</span>
                </p>
                <p className="text-[10px] text-bored-gray-400 mt-0.5">
                  Multiple files supported · Drag to reorder
                </p>
              </div>
            </>
          )}
        </div>
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) handleFiles(e.target.files, 'gallery');
            e.target.value = '';
          }}
        />
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// LIVE PREVIEW — mimics the actual website experience detail page
// ═════════════════════════════════════════════════════════════════════════════
function LivePreview({ data, activeField }: { data: Partial<ExperienceRow>; activeField?: string }) {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const sectionRefs = React.useRef<Record<string, HTMLDivElement | null>>({});

  const img = data.images?.[0] || data.image_url;
  const thumbs = (data.images || []).slice(1, 4);
  const highlights = data.highlights || [];
  const included = data.included || [];
  const toBring = data.what_to_bring || [];
  const languages = data.languages || [];
  const tags = data.tags || [];

  const fields = [
    data.title,
    data.short_description || data.description,
    img,
    data.price,
    data.duration,
    data.city || data.location,
    highlights.length > 0,
    included.length > 0,
    data.cancellation_policy,
  ];
  const completeness = fields.filter(Boolean).length;
  const pct = Math.round((completeness / fields.length) * 100);

  // Map field names to preview section ids
  const fieldToSection: Record<string, string> = {
    title: 'preview-title', short_description: 'preview-description', description: 'preview-description',
    image_url: 'preview-gallery', images: 'preview-gallery', video_url: 'preview-gallery',
    price: 'preview-price', currency: 'preview-price', duration: 'preview-info',
    max_group_size: 'preview-info', languages: 'preview-info',
    city: 'preview-meeting', location: 'preview-meeting', address: 'preview-meeting', meeting_point: 'preview-meeting',
    highlights: 'preview-highlights', included: 'preview-included',
    what_to_bring: 'preview-tobring',
    cancellation_policy: 'preview-policies', important_info: 'preview-policies',
    tags: 'preview-tags', category: 'preview-tags',
  };

  // Auto-scroll preview to relevant section when field changes
  React.useEffect(() => {
    if (!activeField || !scrollRef.current) return;
    const sectionId = fieldToSection[activeField];
    if (!sectionId) return;
    const el = sectionRefs.current[sectionId];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [activeField, data]);

  const setSectionRef = (id: string) => (el: HTMLDivElement | null) => {
    sectionRefs.current[id] = el;
  };

  return (
    <div className="sticky top-6">
      {/* Completeness bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-medium text-bored-gray-500 tracking-wide">
            Page completeness
          </span>
          <span
            className={`text-[11px] font-bold ${
              pct === 100
                ? 'text-bored-black'
                : 'text-bored-gray-400'
            }`}
          >
            {pct}%
          </span>
        </div>
        <div className="h-1 bg-bored-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ease-out ${
              pct === 100
                ? 'bg-bored-black'
                : 'bg-bored-gray-400'
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Preview frame */}
      <div className="bg-white rounded-2xl border border-bored-gray-200/80 overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        {/* Browser chrome */}
        <div className="bg-bored-gray-50 border-b border-bored-gray-100 px-4 py-2.5 flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-[9px] h-[9px] rounded-full bg-[#FF5F57]" />
            <div className="w-[9px] h-[9px] rounded-full bg-[#FFBD2E]" />
            <div className="w-[9px] h-[9px] rounded-full bg-[#27CA40]" />
          </div>
          <div className="flex-1 mx-3 bg-white rounded-md px-3 py-1 text-[9px] text-bored-gray-400 font-mono truncate border border-bored-gray-100">
            bored.fun/experience/
            {(data.title || 'your-experience')
              .toLowerCase()
              .replace(/\s+/g, '-')
              .slice(0, 24)}
          </div>
        </div>

        {/* Page content */}
        <div
          ref={scrollRef}
          className="p-4 max-h-[calc(100vh-220px)] overflow-y-auto scrollbar-thin"
          style={{ fontSize: '10px' }}
        >
          {/* Title area */}
          <div ref={setSectionRef('preview-title')} className="mb-3">
            <h3 className="font-semibold text-bored-black text-[13px] leading-tight mb-0.5">
              {data.title || (
                <span className="text-bored-gray-300 italic">Experience Title</span>
              )}
            </h3>
            <p className="text-bored-gray-400 text-[9px] flex items-center gap-1">
              <MapPin size={8} />
              {data.address ||
                data.location || (
                  <span className="text-bored-gray-200">Location</span>
                )}
            </p>
          </div>

          {/* Image gallery */}
          <div ref={setSectionRef('preview-gallery')}>
          {img ? (
            <div className="mb-3">
              <div className="rounded-xl overflow-hidden h-[130px] bg-bored-gray-100 mb-1.5 relative">
                <img
                  src={img}
                  alt=""
                  className="w-full h-full object-cover"
                />
                {data.video_url && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 bg-black/60 rounded-full flex items-center justify-center backdrop-blur-sm">
                      <Play size={11} className="text-white ml-0.5" />
                    </div>
                  </div>
                )}
              </div>
              {thumbs.length > 0 && (
                <div className="flex gap-1">
                  {thumbs.map((t, i) => (
                    <div
                      key={i}
                      className="flex-1 h-11 rounded-lg overflow-hidden bg-bored-gray-100"
                    >
                      <img
                        src={t}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                  {(data.images || []).length > 4 && (
                    <div className="flex-1 h-11 rounded-lg bg-bored-gray-100 flex items-center justify-center">
                      <Camera size={9} className="text-bored-gray-400" />
                      <span className="text-[7px] text-bored-gray-400 ml-0.5">
                        +{(data.images || []).length - 4}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="mb-3 h-[130px] rounded-xl bg-bored-gray-50 border-2 border-dashed border-bored-gray-200 flex items-center justify-center">
              <div className="text-center">
                <ImageIcon
                  size={18}
                  className="text-bored-gray-300 mx-auto mb-1"
                />
                <p className="text-[8px] text-bored-gray-300">Add images</p>
              </div>
            </div>
          )}
          </div>

          {/* Info bar */}
          <div ref={setSectionRef('preview-info')} className="flex items-center gap-3 mb-3 text-[9px] text-bored-gray-500">
            {data.duration && (
              <span className="flex items-center gap-0.5">
                <Clock size={9} /> {data.duration}
              </span>
            )}
            {data.max_group_size && (
              <span className="flex items-center gap-0.5">
                <Users size={9} /> Up to {data.max_group_size}
              </span>
            )}
            {languages.length > 0 && (
              <span className="flex items-center gap-0.5">
                <Globe size={9} /> {languages[0]}
                {languages.length > 1 ? ` +${languages.length - 1}` : ''}
              </span>
            )}
          </div>

          {/* Price box */}
          <div ref={setSectionRef('preview-price')} className="flex items-center justify-between mb-4 p-2.5 rounded-xl bg-bored-gray-50 border border-bored-gray-100">
            <div>
              <p className="text-[8px] text-bored-gray-400 mb-0.5">From</p>
              <p className="text-[15px] font-bold text-bored-black leading-none">
                {data.price ? (
                  `${fmtCurrency(data.currency)}${data.price}`
                ) : (
                  <span className="text-bored-gray-300">€0</span>
                )}
                <span className="text-[8px] font-normal text-bored-gray-400 ml-0.5">
                  / guest
                </span>
              </p>
              {data.cancellation_policy && (
                <p className="text-[8px] text-bored-gray-500 mt-0.5">
                  Free cancellation
                </p>
              )}
            </div>
            <div className="px-3 py-1.5 bg-bored-black text-white rounded-lg text-[9px] font-medium">
              Book now
            </div>
          </div>

          {/* What you'll do */}
          <div ref={setSectionRef('preview-description')} className="mb-3">
            <p className="font-semibold text-bored-black mb-1 text-[10px]">
              What you'll do
            </p>
            <p className="text-bored-gray-600 leading-relaxed text-[9px]">
              {(data.short_description || data.description || '').slice(0, 160)}
              {(data.short_description || data.description || '').length > 160
                ? '...'
                : ''}
              {!data.short_description && !data.description && (
                <span className="text-bored-gray-300 italic">
                  Add a description...
                </span>
              )}
            </p>
          </div>

          {/* Highlights */}
          <div ref={setSectionRef('preview-highlights')}>
          {highlights.length > 0 && (
            <div className="mb-3 space-y-1">
              {highlights.slice(0, 6).map((h, i) => (
                <div key={i} className="flex items-start gap-1.5">
                  <div className="w-1 h-1 rounded-full bg-bored-black flex-shrink-0 mt-1.5" />
                  <span className="text-[9px] text-bored-gray-700">{h}</span>
                </div>
              ))}
            </div>
          )}
          </div>

          {/* Meeting point */}
          <div ref={setSectionRef('preview-meeting')}>
          {(data.meeting_point || data.address) && (
            <div className="mb-3">
              <p className="font-semibold text-bored-black mb-1 text-[10px]">
                Where we'll meet
              </p>
              <div className="h-14 rounded-lg bg-bored-gray-100 flex items-center justify-center mb-1">
                <MapPin size={12} className="text-bored-gray-300" />
              </div>
              <p className="text-[9px] text-bored-gray-500">
                {data.meeting_point || data.address}
              </p>
            </div>
          )}
          </div>

          {/* What's included */}
          <div ref={setSectionRef('preview-included')}>
          {included.length > 0 && (
            <div className="mb-3">
              <p className="font-semibold text-bored-black mb-1 text-[10px]">
                What's included
              </p>
              <div className="flex flex-wrap gap-1">
                {included.map((item, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-bored-gray-50 text-bored-gray-600 rounded text-[8px]"
                  >
                    <Check size={7} /> {item}
                  </span>
                ))}
              </div>
            </div>
          )}
          </div>

          {/* What to bring */}
          <div ref={setSectionRef('preview-tobring')}>
          {toBring.length > 0 && (
            <div className="mb-3">
              <p className="font-semibold text-bored-black mb-1 text-[10px]">
                What to bring
              </p>
              <div className="flex flex-wrap gap-1">
                {toBring.map((item, i) => (
                  <span
                    key={i}
                    className="px-1.5 py-0.5 bg-bored-gray-50 text-bored-gray-600 rounded text-[8px]"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}
          </div>

          {/* Tags */}
          <div ref={setSectionRef('preview-tags')}>
          {tags.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-1">
              {tags.map((tag, i) => (
                <span
                  key={i}
                  className="px-1.5 py-0.5 bg-bored-gray-50 text-bored-gray-500 rounded text-[8px] border border-bored-gray-100"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          </div>

          {/* Things to know */}
          <div ref={setSectionRef('preview-policies')}>
          {(data.cancellation_policy || data.important_info) && (
            <div className="mb-3">
              <p className="font-semibold text-bored-black mb-1 text-[10px]">
                Things to know
              </p>
              <div className="space-y-2">
                {data.cancellation_policy && (
                  <div>
                    <p className="text-[8px] font-medium text-bored-gray-500 mb-0.5">
                      Cancellation
                    </p>
                    <p className="text-[8px] text-bored-gray-600">
                      {data.cancellation_policy.slice(0, 80)}
                    </p>
                  </div>
                )}
                {data.important_info && (
                  <div>
                    <p className="text-[8px] font-medium text-bored-gray-500 mb-0.5">
                      Important info
                    </p>
                    <p className="text-[8px] text-bored-gray-600">
                      {(data.important_info as string).slice(0, 80)}
                    </p>
                  </div>
                )}
                {data.max_group_size && (
                  <div>
                    <p className="text-[8px] font-medium text-bored-gray-500 mb-0.5">
                      Group size
                    </p>
                    <p className="text-[8px] text-bored-gray-600">
                      Up to {data.max_group_size} guests
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═════════════════════════════════════════════════════════════════════════════

interface CatalogViewProps {
  catalogSection: string;
  activeHotelId?: string | null;
}

export const CatalogView: React.FC<CatalogViewProps> = ({ catalogSection }) => {
  const { activeHotelId } = useAuth();

  const [experiences, setExperiences] = useState<ExperienceRow[]>([]);
  const [catalogIds, setCatalogIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'marketplace' | 'own'>(
    'all'
  );
  const [selectedExp, setSelectedExp] = useState<ExperienceRow | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState<Partial<ExperienceRow>>({});
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>(
    'idle'
  );
  const [creating, setCreating] = useState(false);
  const [newExperience, setNewExperience] = useState<Partial<ExperienceInsert>>(
    { ...BLANK_EXPERIENCE, operator_id: DEMO_OPERATOR_ID }
  );
  const [activeField, setActiveField] = useState<string | undefined>();
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [showViatorImport, setShowViatorImport] = useState(false);

  const isMarketplaceSection = catalogSection === 'activities';

  const loadExperiences = useCallback(async () => {
    setLoading(true);
    const [exps, ids] = await Promise.all([
      isMarketplaceSection
        ? fetchAllExperiences()
        : (() => {
            const category = SECTION_TO_CATEGORY[catalogSection];
            return category ? fetchExperiencesByCategory(category) : Promise.resolve([]);
          })(),
      activeHotelId ? fetchHotelCatalogIds(activeHotelId) : Promise.resolve(new Set<number>()),
    ]);
    setExperiences(exps);
    setCatalogIds(ids);
    setLoading(false);
  }, [catalogSection, isMarketplaceSection, activeHotelId]);

  useEffect(() => {
    loadExperiences();
    setSelectedExp(null);
    setEditMode(false);
    setCreating(false);
    setSearchQuery('');
    setFilterTab('all');
  }, [catalogSection, loadExperiences]);

  // Experience created by this specific hotel
  const isOwnExperience = (exp: ExperienceRow) =>
    !!activeHotelId && exp.created_by_hotel_id === activeHotelId;

  // Experience added to this hotel's catalog (via hotel_experiences join table)
  const isInCatalog = (exp: ExperienceRow) => catalogIds.has(exp.id);

  const filtered = experiences.filter((exp) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (
        !exp.title.toLowerCase().includes(q) &&
        !exp.category.toLowerCase().includes(q) &&
        !(exp.city || '').toLowerCase().includes(q)
      )
        return false;
    }
    if (filterTab === 'marketplace' && isInCatalog(exp)) return false;
    if (filterTab === 'own' && !isOwnExperience(exp)) return false;
    return true;
  });

  const marketplaceCount = experiences.filter((e) => !isInCatalog(e)).length;
  const ownCount = experiences.filter((e) => isOwnExperience(e)).length;

  // ── CRUD ────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!selectedExp) return;
    setSaving(true);
    const result = await updateExperience(selectedExp.id, editData);
    setSaving(false);
    if (result.success) {
      setSaveStatus('saved');
      setExperiences((prev) =>
        prev.map((e) =>
          e.id === selectedExp.id ? { ...e, ...editData } : e
        )
      );
      setSelectedExp((prev) => (prev ? { ...prev, ...editData } : prev));
      setTimeout(() => setSaveStatus('idle'), 2000);
    } else {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const handleCreate = async () => {
    setSaving(true);
    const result = await createExperience(newExperience as ExperienceInsert, activeHotelId ?? undefined);
    setSaving(false);
    if (result.success && result.data) {
      setExperiences((prev) => [...prev, result.data!]);
      // Auto-mark as in catalog
      if (activeHotelId) setCatalogIds(prev => new Set([...prev, result.data!.id]));
      setCreating(false);
      setSelectedExp(result.data);
      setEditMode(true);
      setEditData(result.data);
      setNewExperience({ ...BLANK_EXPERIENCE, operator_id: DEMO_OPERATOR_ID });
    }
  };

  const handleAddToCatalog = async (exp: ExperienceRow) => {
    if (!activeHotelId) return;
    const result = await addExperienceToHotelCatalog(activeHotelId, exp.id);
    if (result.success) setCatalogIds(prev => new Set([...prev, exp.id]));
  };

  const handleRemoveFromCatalog = async (exp: ExperienceRow) => {
    if (!activeHotelId) return;
    const result = await removeExperienceFromHotelCatalog(activeHotelId, exp.id);
    if (result.success) setCatalogIds(prev => { const s = new Set(prev); s.delete(exp.id); return s; });
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this experience? This cannot be undone.')) return;
    const result = await deleteExperience(id);
    if (result.success) {
      setExperiences((prev) => prev.filter((e) => e.id !== id));
      setSelectedExp(null);
      setEditMode(false);
    }
  };

  const handleToggleActive = async (exp: ExperienceRow) => {
    const result = await toggleExperienceActive(exp.id, !exp.is_active);
    if (result.success) {
      setExperiences((prev) =>
        prev.map((e) =>
          e.id === exp.id ? { ...e, is_active: !e.is_active } : e
        )
      );
      if (selectedExp?.id === exp.id)
        setSelectedExp((prev) =>
          prev ? { ...prev, is_active: !prev.is_active } : prev
        );
    }
  };

  const sectionTitle =
    catalogSection === 'activities'
      ? 'Hotel Activities'
      : catalogSection === 'spa'
      ? 'Spa & Wellness'
      : catalogSection === 'rentals'
      ? 'Rentals'
      : catalogSection === 'packages'
      ? 'Packages'
      : 'Catalog';

  // ═══════════════════════════════════════════════════════════════════════
  // CREATE VIEW — split layout with live preview
  // ═══════════════════════════════════════════════════════════════════════
  if (creating) {
    return (
      <div className="max-w-[1440px] mx-auto px-8 py-2">
        {/* Back */}
        <button
          onClick={() => setCreating(false)}
          className="flex items-center gap-2 text-[13px] text-bored-gray-400 hover:text-bored-black mb-5 transition-colors group"
        >
          <ArrowLeft
            size={15}
            className="group-hover:-translate-x-0.5 transition-transform"
          />{' '}
          {sectionTitle}
        </button>

        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-[22px] font-semibold tracking-tight text-bored-black">
              New Experience
            </h1>
            <p className="text-[13px] text-bored-gray-400 mt-0.5">
              Fill in the details — the preview updates live as you type
            </p>
          </div>
          <button
            onClick={handleCreate}
            disabled={saving || !newExperience.title}
            className="flex items-center gap-2 px-6 py-2.5 bg-bored-black text-white rounded-xl hover:bg-bored-gray-800 text-sm font-medium disabled:opacity-30 transition-all shadow-sm"
          >
            {saving ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Plus size={15} />
            )}
            Publish Experience
          </button>
        </div>

        {/* Split layout */}
        <div className="flex gap-8 items-start">
          <div className="flex-1 min-w-0">
            <ExperienceForm
              data={newExperience}
              onChange={(f, v) => {
                setNewExperience((prev) => ({ ...prev, [f]: v }));
                setActiveField(f);
              }}
            />
          </div>
          <div className="w-[360px] flex-shrink-0">
            <LivePreview data={newExperience} activeField={activeField} />
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════
  // DETAIL / EDIT VIEW
  // ═══════════════════════════════════════════════════════════════════════
  if (selectedExp) {
    const isOwn = isOwnExperience(selectedExp);
    const displayData = editMode
      ? { ...selectedExp, ...editData }
      : selectedExp;

    return (
      <div
        className={
          editMode
            ? 'max-w-[1440px] mx-auto px-8 py-2'
            : 'max-w-4xl mx-auto px-8 py-2'
        }
      >
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-[13px] text-bored-gray-400 mb-5">
          <span
            className="cursor-pointer hover:text-bored-black transition-colors"
            onClick={() => {
              setSelectedExp(null);
              setEditMode(false);
            }}
          >
            {sectionTitle}
          </span>
          <ChevronRight size={12} />
          <span className="text-bored-black font-medium truncate max-w-xs">
            {displayData.title || 'Untitled'}
          </span>
        </nav>

        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1 min-w-0">
            <button
              onClick={() => {
                setSelectedExp(null);
                setEditMode(false);
              }}
              className="flex items-center gap-1.5 text-[13px] text-bored-gray-400 hover:text-bored-black mb-3 transition-colors group"
            >
              <ArrowLeft
                size={14}
                className="group-hover:-translate-x-0.5 transition-transform"
              />{' '}
              Back
            </button>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-[22px] font-semibold tracking-tight text-bored-black truncate">
                {displayData.title || 'Untitled'}
              </h1>
              {!isOwn && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-bored-gray-50 text-bored-gray-500 border border-bored-gray-200 flex-shrink-0">
                  <Lock size={9} /> Marketplace
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-medium ${
                  displayData.is_active
                    ? 'bg-bored-gray-900 text-white'
                    : 'bg-bored-gray-100 text-bored-gray-500'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    displayData.is_active
                      ? 'bg-bored-neon'
                      : 'bg-bored-gray-400'
                  }`}
                />
                {displayData.is_active ? 'Live' : 'Draft'}
              </span>
              {displayData.verified && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-medium bg-bored-gray-50 text-bored-gray-500 border border-bored-gray-100">
                  <Shield size={9} /> Verified
                </span>
              )}
              {displayData.instant_booking && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-medium bg-bored-gray-50 text-bored-gray-500 border border-bored-gray-100">
                  <Zap size={9} /> Instant
                </span>
              )}
              {displayData.rating ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-medium bg-bored-gray-50 text-bored-gray-600 border border-bored-gray-100">
                  <Star size={9} />{' '}
                  {displayData.rating}
                </span>
              ) : null}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 ml-6">
            {!editMode && (
              <button
                onClick={() => {
                  const url = `${window.location.origin}/experience/${selectedExp.id}`;
                  if (navigator.share) {
                    navigator.share({ title: displayData.title || '', text: displayData.short_description || displayData.description || '', url });
                  } else {
                    navigator.clipboard.writeText(url);
                  }
                }}
                className="flex items-center gap-2 px-4 py-2.5 border border-bored-gray-200 rounded-xl text-sm font-medium text-bored-gray-600 hover:bg-bored-gray-50 transition-colors"
              >
                <Share2 size={14} /> Share
              </button>
            )}
            {isOwn && !editMode && (
              <button
                onClick={() => {
                  setEditMode(true);
                  setEditData(selectedExp);
                }}
                className="flex items-center gap-2 px-5 py-2.5 bg-bored-black text-white rounded-xl text-sm font-medium hover:bg-bored-gray-800 transition-colors shadow-sm"
              >
                <Pen size={14} /> Edit
              </button>
            )}
            {editMode && (
              <>
                <button
                  onClick={() => {
                    setEditMode(false);
                    setEditData({});
                  }}
                  className="px-4 py-2.5 border border-bored-gray-200 rounded-xl text-sm font-medium text-bored-gray-600 hover:bg-bored-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    await handleSave();
                    setEditMode(false);
                    setEditData({});
                  }}
                  disabled={saving}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all shadow-sm bg-bored-black text-white hover:bg-bored-gray-800 disabled:opacity-30`}
                >
                  {saving ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <CheckCircle size={14} />
                  )}
                  {saving ? 'Saving...' : 'Done'}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Marketplace lock banner */}
        {!isOwn && (
          <div className="mb-6 p-3.5 rounded-xl bg-bored-gray-50 border border-bored-gray-200 flex items-center gap-3">
            <Lock size={14} className="text-bored-gray-400 flex-shrink-0" />
            <p className="text-xs text-bored-gray-500">
              This is a <strong>Bored. marketplace</strong> experience — view
              only. It appears in your catalog for guests to book.
            </p>
          </div>
        )}

        {/* Content — split when editing */}
        <div className={editMode ? 'flex gap-8 items-start' : ''}>
          <div className={editMode ? 'flex-1 min-w-0' : ''}>
            {editMode ? (
              <ExperienceForm
                data={displayData}
                onChange={(f, v) => {
                  setEditData((prev) => ({ ...prev, [f]: v }));
                  setActiveField(f);
                }}
              />
            ) : (
              <ReadOnlyDetail data={displayData} />
            )}
            {/* Danger zone */}
            {isOwn && editMode && (
              <div className="mt-8 mb-12 p-5 rounded-xl border border-red-200 bg-red-50/30">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-red-700">
                      Delete experience
                    </h3>
                    <p className="text-xs text-red-500/80 mt-0.5">
                      This action is permanent and cannot be undone.
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(selectedExp.id)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-medium hover:bg-red-700 transition-colors"
                  >
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              </div>
            )}
          </div>
          {editMode && (
            <div className="w-[360px] flex-shrink-0">
              <LivePreview data={displayData} activeField={activeField} />
            </div>
          )}
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════
  // LIST VIEW
  // ═══════════════════════════════════════════════════════════════════════
  return (
    <div className="max-w-6xl mx-auto px-8 py-2">
      {/* Header */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight text-bored-black">
            {sectionTitle}
          </h1>
          <p className="text-[13px] text-bored-gray-400 mt-0.5">
            {isMarketplaceSection
              ? `${experiences.length} experiences from the Bored. marketplace`
              : `${experiences.length} ${sectionTitle.toLowerCase()} managed by your hotel`}
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowViatorImport(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:from-orange-600 hover:to-red-600 text-sm font-medium transition-all shadow-sm"
          >
            <Globe size={14} /> Import from Viator
          </button>
          <button
            onClick={() => setShowBulkUpload(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white rounded-xl hover:from-violet-600 hover:to-fuchsia-600 text-sm font-medium transition-all shadow-sm"
          >
            <Sparkles size={14} /> Import from Document
          </button>
          <button
            onClick={() => setCreating(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-bored-black text-white rounded-xl hover:bg-bored-gray-800 text-sm font-medium transition-colors shadow-sm"
          >
            <Plus size={15} /> New Experience
          </button>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 relative">
          <Search
            size={15}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-bored-gray-300"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${sectionTitle.toLowerCase()}...`}
            className="w-full pl-10 pr-4 py-2.5 border border-bored-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-bored-neon/20 focus:border-bored-gray-300 placeholder:text-bored-gray-300 transition-shadow"
          />
        </div>
        {isMarketplaceSection && (
          <div className="flex bg-bored-gray-50 rounded-xl p-0.5 border border-bored-gray-100">
            {[
              {
                key: 'all' as const,
                label: 'All',
                count: experiences.length,
              },
              {
                key: 'marketplace' as const,
                label: 'Bored.',
                count: marketplaceCount,
              },
              { key: 'own' as const, label: 'Yours', count: ownCount },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilterTab(tab.key)}
                className={`px-3.5 py-1.5 rounded-[10px] text-[11px] font-medium transition-all ${
                  filterTab === tab.key
                    ? 'bg-white text-bored-black shadow-sm border border-bored-gray-100'
                    : 'text-bored-gray-400 hover:text-bored-black'
                }`}
              >
                {tab.label}{' '}
                <span className="opacity-40 ml-0.5">{tab.count}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-32">
          <Loader2 size={20} className="animate-spin text-bored-gray-300" />
        </div>
      )}

      {/* Grid */}
      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((exp) => {
            const isOwn = isOwnExperience(exp);
            const img = exp.images?.[0] || exp.image_url;
            return (
              <div
                key={exp.id}
                onClick={() => setSelectedExp(exp)}
                className="group bg-white rounded-2xl border border-bored-gray-100 overflow-hidden hover:border-bored-gray-200 hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.08)] transition-all duration-300 cursor-pointer"
              >
                {/* Image */}
                <div className="h-44 w-full overflow-hidden bg-bored-gray-50 relative">
                  {img ? (
                    <img
                      src={img}
                      alt={exp.title}
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon size={28} className="text-bored-gray-200" />
                    </div>
                  )}
                  {/* Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  {/* Top badges */}
                  <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
                    {isMarketplaceSection ? (
                      isOwn ? (
                        <span className="px-2 py-0.5 rounded-md text-[9px] font-semibold bg-white/85 text-bored-black backdrop-blur-sm">
                          Yours
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md text-[9px] font-semibold bg-white/85 text-bored-gray-500 backdrop-blur-sm">
                          Bored.
                        </span>
                      )
                    ) : (
                      <span />
                    )}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const url = `${window.location.origin}/experience/${exp.id}`;
                          if (navigator.share) {
                            navigator.share({ title: exp.title, text: exp.short_description || exp.description || '', url });
                          } else {
                            navigator.clipboard.writeText(url);
                          }
                        }}
                        className="w-7 h-7 rounded-lg flex items-center justify-center backdrop-blur-sm transition-colors bg-white/85 text-bored-black hover:bg-white"
                        title="Share experience"
                      >
                        <Share2 size={13} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleActive(exp);
                        }}
                        className={`w-7 h-7 rounded-lg flex items-center justify-center backdrop-blur-sm transition-colors ${
                          exp.is_active
                            ? 'bg-white/85 text-bored-black'
                            : 'bg-white/60 text-bored-gray-400'
                        }`}
                      >
                        {exp.is_active ? <Eye size={13} /> : <EyeOff size={13} />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="text-[10px] text-bored-gray-400 font-medium tracking-wide uppercase">
                      {exp.category}
                    </span>
                    {exp.verified && (
                      <Shield
                        size={10}
                        className="text-bored-gray-300 ml-auto flex-shrink-0"
                      />
                    )}
                  </div>
                  <h3 className="text-[13px] font-medium text-bored-black leading-snug line-clamp-2 mb-1 min-h-[2.5rem]">
                    {exp.title}
                  </h3>
                  {/* Short description */}
                  {(exp.short_description || exp.description) && (
                    <p className="text-[11px] text-bored-gray-400 leading-snug line-clamp-2 mb-2.5">
                      {exp.short_description || exp.description}
                    </p>
                  )}
                  {/* Meta row: duration, city, languages */}
                  <div className="flex items-center gap-2.5 text-[11px] text-bored-gray-400 mb-2.5">
                    {exp.duration && (
                      <span className="flex items-center gap-1">
                        <Clock size={11} /> {exp.duration}
                      </span>
                    )}
                    {exp.city && (
                      <span className="flex items-center gap-1">
                        <MapPin size={11} /> {exp.city}
                      </span>
                    )}
                    {exp.languages && exp.languages.length > 0 && (
                      <span className="flex items-center gap-1">
                        <Globe size={11} /> {exp.languages.length}
                      </span>
                    )}
                  </div>
                  {/* Highlights preview */}
                  {exp.highlights && exp.highlights.length > 0 && (
                    <div className="space-y-1 mb-2.5">
                      {exp.highlights.slice(0, 2).map((h, i) => (
                        <div key={i} className="flex items-start gap-1.5">
                          <span className="text-bored-gray-300 mt-px flex-shrink-0">·</span>
                          <span className="text-[10px] text-bored-gray-500 leading-snug line-clamp-1">{h}</span>
                        </div>
                      ))}
                      {exp.highlights.length > 2 && (
                        <span className="text-[9px] text-bored-gray-400 ml-3.5">+{exp.highlights.length - 2} more</span>
                      )}
                    </div>
                  )}
                  {/* Info chips: included, what to bring */}
                  {((exp.included && exp.included.length > 0) || (exp.what_to_bring && exp.what_to_bring.length > 0) || exp.cancellation_policy) && (
                    <div className="flex flex-wrap gap-1 mb-2.5">
                      {exp.included && exp.included.length > 0 && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-bored-gray-50 text-bored-gray-500 rounded text-[9px] font-medium">
                          <Check size={8} /> {exp.included.length} included
                        </span>
                      )}
                      {exp.what_to_bring && exp.what_to_bring.length > 0 && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-bored-gray-50 text-bored-gray-500 rounded text-[9px] font-medium">
                          <Package size={8} /> {exp.what_to_bring.length} to bring
                        </span>
                      )}
                      {exp.cancellation_policy && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-bored-gray-50 text-bored-gray-500 rounded text-[9px] font-medium">
                          <CheckCircle size={8} /> Free cancel
                        </span>
                      )}
                    </div>
                  )}
                  {/* Price row */}
                  <div className="flex items-center justify-between pt-2.5 border-t border-bored-gray-50">
                    <div className="flex items-center gap-2 text-[11px] text-bored-gray-400">
                      {exp.instant_booking && (
                        <span className="flex items-center gap-0.5">
                          <Zap size={10} /> Instant
                        </span>
                      )}
                      {exp.rating > 0 && (
                        <span className="flex items-center gap-0.5">
                          <Star size={10} /> {exp.rating}
                        </span>
                      )}
                    </div>
                    <span className="text-sm font-semibold text-bored-black">
                      {fmtCurrency(exp.currency)}
                      {exp.price}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty */}
      {!loading && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <div className="w-14 h-14 rounded-2xl bg-bored-gray-50 flex items-center justify-center mb-4">
            <Package size={24} className="text-bored-gray-300" />
          </div>
          <h3 className="text-base font-medium text-bored-black mb-1">
            No experiences found
          </h3>
          <p className="text-sm text-bored-gray-400 mb-6 max-w-sm">
            {searchQuery
              ? 'Try a different search term'
              : filterTab === 'own'
              ? "You haven't created any experiences yet"
              : 'Nothing here yet'}
          </p>
          {(filterTab === 'own' || !isMarketplaceSection) && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowViatorImport(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl text-sm font-medium hover:from-orange-600 hover:to-red-600 transition-all shadow-sm"
              >
                <Globe size={15} /> Import from Viator
              </button>
              <button
                onClick={() => setShowBulkUpload(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white rounded-xl text-sm font-medium hover:from-violet-600 hover:to-fuchsia-600 transition-all shadow-sm"
              >
                <Sparkles size={15} /> Import from Document
              </button>
              <button
                onClick={() => setCreating(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-bored-black text-white rounded-xl text-sm font-medium hover:bg-bored-gray-800 transition-colors"
              >
                <Plus size={15} /> Create Experience
              </button>
            </div>
          )}
        </div>
      )}

      {/* Viator Import Modal */}
      <ViatorImportModal
        open={showViatorImport}
        onClose={() => setShowViatorImport(false)}
        onComplete={(created) => {
          setExperiences((prev) => [...prev, created]);
          if (activeHotelId) {
            addExperienceToHotelCatalog(activeHotelId, created.id);
            setCatalogIds(prev => new Set([...prev, created.id]));
          }
          setShowViatorImport(false);
        }}
        operatorId={DEMO_OPERATOR_ID}
      />

      {/* Bulk Upload Modal */}
      <BulkUploadModal
        open={showBulkUpload}
        onClose={() => setShowBulkUpload(false)}
        onComplete={(created) => {
          setExperiences((prev) => [...prev, ...created]);
          if (activeHotelId) {
            created.forEach(e => addExperienceToHotelCatalog(activeHotelId, e.id));
            setCatalogIds(prev => new Set([...prev, ...created.map(e => e.id)]));
          }
          setShowBulkUpload(false);
        }}
        operatorId={DEMO_OPERATOR_ID}
        defaultCategory={SECTION_TO_CATEGORY[catalogSection]}
        hotelContext={{
          city: '',
          location: '',
          address: '',
        }}
      />
    </div>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// READ-ONLY DETAIL VIEW — rich, editorial layout
// ═════════════════════════════════════════════════════════════════════════════

function ReadOnlyDetail({ data }: { data: Partial<ExperienceRow> }) {
  const img = data.images?.[0] || data.image_url;
  const gallery = data.images || [];
  const highlights = data.highlights || [];
  const included = data.included || [];
  const toBring = data.what_to_bring || [];
  const languages = data.languages || [];
  const tags = data.tags || [];

  return (
    <div className="space-y-6 pb-8">
      {/* Hero + Gallery */}
      {img && (
        <div>
          <div className="h-72 rounded-2xl overflow-hidden bg-bored-gray-100 mb-2 relative">
            <img
              src={img}
              alt={data.title || ''}
              className="w-full h-full object-cover"
            />
            {data.video_url && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                <div className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center shadow-lg backdrop-blur-sm">
                  <Play size={22} className="text-bored-black ml-1" />
                </div>
              </div>
            )}
          </div>
          {gallery.length > 1 && (
            <div className="flex gap-2">
              {gallery.slice(1, 5).map((g, i) => (
                <div
                  key={i}
                  className="flex-1 h-20 rounded-xl overflow-hidden bg-bored-gray-100"
                >
                  <img
                    src={g}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
              {gallery.length > 5 && (
                <div className="flex-1 h-20 rounded-xl bg-bored-gray-100 flex items-center justify-center">
                  <span className="text-xs text-bored-gray-400">
                    +{gallery.length - 5}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Quick info bar */}
      <div className="flex items-center gap-4 text-sm text-bored-gray-500">
        {data.duration && (
          <span className="flex items-center gap-1.5">
            <Clock size={14} className="text-bored-gray-400" /> {data.duration}
          </span>
        )}
        {data.max_group_size && (
          <span className="flex items-center gap-1.5">
            <Users size={14} className="text-bored-gray-400" /> Up to{' '}
            {data.max_group_size} guests
          </span>
        )}
        {languages.length > 0 && (
          <span className="flex items-center gap-1.5">
            <Globe size={14} className="text-bored-gray-400" />{' '}
            {languages.join(', ')}
          </span>
        )}
      </div>

      {/* Price + booking */}
      <div className="flex items-center justify-between p-5 rounded-2xl bg-bored-gray-50/60 border border-bored-gray-100">
        <div>
          <p className="text-xs text-bored-gray-400 mb-0.5">From</p>
          <p className="text-2xl font-bold text-bored-black">
            {fmtCurrency(data.currency)}
            {data.price}
            <span className="text-sm font-normal text-bored-gray-400 ml-1">
              / guest
            </span>
          </p>
          {data.cancellation_policy && (
            <p className="text-xs text-bored-gray-500 mt-0.5 flex items-center gap-1">
              <CheckCircle size={11} /> Free cancellation
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {data.instant_booking && (
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bored-gray-50 text-bored-gray-600 text-xs font-medium border border-bored-gray-100">
              <Zap size={12} /> Instant booking
            </span>
          )}
        </div>
      </div>

      {/* Description */}
      {(data.description || data.short_description) && (
        <div>
          <h2 className="text-[15px] font-semibold text-bored-black mb-2">
            What you'll do
          </h2>
          {data.short_description && (
            <p className="text-sm text-bored-gray-700 font-medium mb-2">
              {data.short_description}
            </p>
          )}
          {data.description && (
            <p className="text-sm text-bored-gray-600 leading-relaxed whitespace-pre-wrap">
              {data.description}
            </p>
          )}
        </div>
      )}

      {/* Highlights */}
      {highlights.length > 0 && (
        <div className="space-y-2.5">
          {highlights.map((h, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-1 h-1 rounded-full bg-bored-black flex-shrink-0 mt-2" />
              <span className="text-sm text-bored-gray-700">{h}</span>
            </div>
          ))}
        </div>
      )}

      {/* Location */}
      {(data.meeting_point || data.address) && (
        <div>
          <h2 className="text-[15px] font-semibold text-bored-black mb-2">
            Where we'll meet
          </h2>
          <div className="h-28 rounded-2xl bg-bored-gray-50 border border-bored-gray-100 flex items-center justify-center mb-2">
            <MapPin size={20} className="text-bored-gray-300" />
          </div>
          <p className="text-sm text-bored-gray-600">
            {data.meeting_point || data.address}
          </p>
          {data.city && (
            <p className="text-xs text-bored-gray-400 mt-0.5">{data.city}</p>
          )}
        </div>
      )}

      {/* What's included */}
      {included.length > 0 && (
        <div>
          <h2 className="text-[15px] font-semibold text-bored-black mb-2">
            What's included
          </h2>
          <div className="flex flex-wrap gap-1.5">
            {included.map((item, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-bored-gray-50 text-bored-gray-700 rounded-lg text-xs font-medium border border-bored-gray-100"
              >
                <Check size={11} /> {item}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* What to bring */}
      {toBring.length > 0 && (
        <div>
          <h2 className="text-[15px] font-semibold text-bored-black mb-2">
            What to bring
          </h2>
          <div className="flex flex-wrap gap-1.5">
            {toBring.map((item, i) => (
              <span
                key={i}
                className="px-3 py-1.5 bg-bored-gray-50 text-bored-gray-700 rounded-lg text-xs font-medium border border-bored-gray-100"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <div>
          <h2 className="text-[15px] font-semibold text-bored-black mb-2">
            Tags
          </h2>
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag, i) => (
              <span
                key={i}
                className="px-3 py-1.5 bg-bored-gray-50 text-bored-gray-600 rounded-lg text-xs font-medium border border-bored-gray-100"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Policies */}
      {(data.cancellation_policy || data.important_info) && (
        <div>
          <h2 className="text-[15px] font-semibold text-bored-black mb-3">
            Things to know
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {data.cancellation_policy && (
              <div className="p-4 rounded-xl bg-bored-gray-50/60 border border-bored-gray-100">
                <h3 className="text-[10px] font-semibold text-bored-gray-400 mb-1 uppercase tracking-wider">
                  Cancellation
                </h3>
                <p className="text-sm text-bored-gray-700">
                  {data.cancellation_policy}
                </p>
              </div>
            )}
            {data.important_info && (
              <div className="p-4 rounded-xl bg-bored-gray-50/60 border border-bored-gray-100">
                <h3 className="text-[10px] font-semibold text-bored-gray-400 mb-1 uppercase tracking-wider">
                  Important info
                </h3>
                <p className="text-sm text-bored-gray-700 whitespace-pre-wrap">
                  {data.important_info}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Meta footer */}
      <div className="flex items-center gap-6 pt-4 border-t border-bored-gray-100 text-[11px] text-bored-gray-400">
        {data.rating ? (
          <span className="flex items-center gap-1">
            <Star size={11} />{' '}
            {data.rating} ({data.review_count || 0} reviews)
          </span>
        ) : null}
        {data.view_count ? (
          <span>{data.view_count.toLocaleString()} views</span>
        ) : null}
        {data.created_at && (
          <span>
            Created {new Date(data.created_at).toLocaleDateString()}
          </span>
        )}
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// EXPERIENCE FORM — used in create & edit modes
// ═════════════════════════════════════════════════════════════════════════════

function ExperienceForm({
  data,
  onChange,
}: {
  data: Partial<ExperienceRow>;
  onChange: (field: string, value: any) => void;
}) {
  const [aiLoading, setAiLoading] = useState(false);
  const [aiDone, setAiDone] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const handleAIGenerate = async () => {
    if (!data.title || data.title.trim().length < 3) return;
    setAiLoading(true);
    setAiError(null);
    setAiDone(false);

    try {
      const result = await generateExperienceFields(data.title, {
        price: data.price || undefined,
        category: data.category || undefined,
        duration: data.duration || undefined,
        city: data.city || undefined,
      });

      // Only fill fields that are empty — don't overwrite user input
      const isEmpty = (v: any) => !v || (Array.isArray(v) && v.length === 0);

      if (isEmpty(data.description)) onChange('description', result.description);
      if (isEmpty(data.short_description)) onChange('short_description', result.short_description);
      if (isEmpty(data.category)) onChange('category', result.category);
      if (isEmpty(data.duration)) onChange('duration', result.duration);
      if (isEmpty(data.tags)) onChange('tags', result.tags);
      if (isEmpty(data.highlights)) onChange('highlights', result.highlights);
      if (isEmpty(data.included)) onChange('included', result.included);
      if (isEmpty(data.what_to_bring)) onChange('what_to_bring', result.what_to_bring);
      if (isEmpty(data.languages)) onChange('languages', result.languages);
      if (!data.cancellation_policy || data.cancellation_policy === 'Free cancellation up to 24 hours in advance for a full refund') {
        onChange('cancellation_policy', result.cancellation_policy);
      }
      if (isEmpty(data.important_info)) onChange('important_info', result.important_info);

      setAiDone(true);
      setTimeout(() => setAiDone(false), 3000);
    } catch (err: any) {
      console.error('[AI Generate]', err);
      setAiError(err.message || 'Failed to generate');
      setTimeout(() => setAiError(null), 4000);
    } finally {
      setAiLoading(false);
    }
  };

  const canGenerate = data.title && data.title.trim().length >= 3 && !aiLoading;

  return (
    <div className="space-y-4 pb-8">
      <FormSection title="Basic Information" defaultOpen>
        {/* Title + AI Generate */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-[11px] font-medium text-bored-gray-400 uppercase tracking-wider">
              Title
            </label>
            {/* AI Generate button */}
            <button
              onClick={handleAIGenerate}
              disabled={!canGenerate}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-medium transition-all ${
                aiLoading
                  ? 'bg-violet-50 text-violet-500 cursor-wait'
                  : aiDone
                  ? 'bg-emerald-50 text-emerald-600'
                  : aiError
                  ? 'bg-red-50 text-red-500'
                  : canGenerate
                  ? 'bg-violet-50 text-violet-600 hover:bg-violet-100 hover:text-violet-700'
                  : 'bg-bored-gray-50 text-bored-gray-300 cursor-not-allowed'
              }`}
              title={
                !data.title || data.title.trim().length < 3
                  ? 'Type a title first (at least 3 characters)'
                  : 'AI will fill all empty fields based on the title'
              }
            >
              {aiLoading ? (
                <>
                  <Loader2 size={11} className="animate-spin" />
                  Generating...
                </>
              ) : aiDone ? (
                <>
                  <CheckCircle size={11} />
                  Fields filled!
                </>
              ) : aiError ? (
                <>
                  <X size={11} />
                  {aiError.slice(0, 30)}
                </>
              ) : (
                <>
                  <Sparkles size={11} />
                  Auto-fill with AI
                </>
              )}
            </button>
          </div>
          <input
            type="text"
            value={data.title ?? ''}
            onChange={(e) => onChange('title', e.target.value)}
            placeholder="e.g. Sunset Kayak Tour, Bamboo Massage, Wine Tasting..."
            className="w-full px-3.5 py-2.5 border border-bored-gray-150 rounded-xl text-sm text-bored-black bg-white focus:outline-none focus:ring-2 focus:ring-bored-neon/20 focus:border-bored-gray-300 placeholder:text-bored-gray-300 transition-shadow"
          />
          {!data.title && (
            <p className="text-[10px] text-bored-gray-300 mt-1 flex items-center gap-1">
              <Sparkles size={9} />
              Type a title and click "Auto-fill with AI" to generate all details
            </p>
          )}
        </div>

        <FormField
          label="Short description"
          value={data.short_description}
          field="short_description"
          onChange={onChange}
          placeholder="One-line hook that appears on cards"
        />
        <FormTextarea
          label="Full description"
          value={data.description}
          field="description"
          onChange={onChange}
          rows={5}
          placeholder="Describe the full experience..."
        />
        <div className="grid grid-cols-3 gap-3">
          <FormField
            label="Price"
            value={data.price}
            field="price"
            onChange={onChange}
            type="number"
          />
          <FormSelect
            label="Currency"
            value={data.currency}
            field="currency"
            onChange={onChange}
            options={CURRENCY_OPTIONS.map((c) => ({ value: c, label: c }))}
          />
          <FormField
            label="Duration"
            value={data.duration}
            field="duration"
            onChange={onChange}
            placeholder="e.g. 2h"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormSelect
            label="Category"
            value={data.category}
            field="category"
            onChange={onChange}
            options={CATEGORY_OPTIONS.map((c) => ({ value: c, label: c }))}
          />
          <FormField
            label="Max group size"
            value={data.max_group_size}
            field="max_group_size"
            onChange={onChange}
            type="number"
            placeholder="∞"
          />
        </div>
        <FormTags
          label="Tags"
          value={data.tags}
          field="tags"
          onChange={onChange}
          placeholder="Add a tag"
        />
      </FormSection>

      <FormSection title="Location">
        <div className="grid grid-cols-2 gap-3">
          <FormField
            label="City"
            value={data.city}
            field="city"
            onChange={onChange}
          />
          <FormField
            label="Location name"
            value={data.location}
            field="location"
            onChange={onChange}
          />
        </div>
        <FormField
          label="Address"
          value={data.address}
          field="address"
          onChange={onChange}
        />
        <FormField
          label="Meeting point"
          value={data.meeting_point}
          field="meeting_point"
          onChange={onChange}
          placeholder="Where guests should go"
        />
        <div className="grid grid-cols-2 gap-3">
          <FormField
            label="Latitude"
            value={data.latitude}
            field="latitude"
            onChange={onChange}
            type="number"
          />
          <FormField
            label="Longitude"
            value={data.longitude}
            field="longitude"
            onChange={onChange}
            type="number"
          />
        </div>
      </FormSection>

      <FormSection title="Media" defaultOpen>
        <MediaSection data={data} onChange={onChange} />
      </FormSection>

      <FormSection title="Experience details">
        <FormTags
          label="Highlights"
          value={data.highlights}
          field="highlights"
          onChange={onChange}
          placeholder="Add highlight"
        />
        <FormTags
          label="What's included"
          value={data.included}
          field="included"
          onChange={onChange}
          placeholder="Add inclusion"
        />
        <FormTags
          label="What to bring"
          value={data.what_to_bring}
          field="what_to_bring"
          onChange={onChange}
          placeholder="Add item"
        />
        <FormTags
          label="Languages"
          value={data.languages}
          field="languages"
          onChange={onChange}
          placeholder="Add language"
          suggestions={LANGUAGE_OPTIONS}
        />
      </FormSection>

      <FormSection title="Policies">
        <FormTextarea
          label="Cancellation policy"
          value={data.cancellation_policy}
          field="cancellation_policy"
          onChange={onChange}
          rows={2}
        />
        <FormTextarea
          label="Important info"
          value={data.important_info}
          field="important_info"
          onChange={onChange}
          rows={3}
        />
      </FormSection>

      <FormSection title="Settings">
        <div className="grid grid-cols-2 gap-3">
          <FormToggle
            label="Instant booking"
            desc="No approval needed"
            value={data.instant_booking}
            field="instant_booking"
            onChange={onChange}
          />
          <FormToggle
            label="Available today"
            desc="Show as bookable today"
            value={data.available_today}
            field="available_today"
            onChange={onChange}
          />
          <FormToggle
            label="Active"
            desc="Visible to guests"
            value={data.is_active}
            field="is_active"
            onChange={onChange}
          />
          <FormToggle
            label="Verified"
            desc="Verified by Bored."
            value={data.verified}
            field="verified"
            onChange={onChange}
          />
        </div>
      </FormSection>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// FORM PRIMITIVES
// ═════════════════════════════════════════════════════════════════════════════

function FormSection({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-xl border border-bored-gray-100 overflow-hidden transition-shadow hover:shadow-[0_1px_4px_rgba(0,0,0,0.03)]">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-bored-gray-50/40 transition-colors"
      >
        <span className="text-[13px] font-semibold text-bored-black">
          {title}
        </span>
        {open ? (
          <ChevronUp size={14} className="text-bored-gray-400" />
        ) : (
          <ChevronDown size={14} className="text-bored-gray-400" />
        )}
      </button>
      {open && (
        <div className="px-5 pb-5 pt-3 space-y-3 border-t border-bored-gray-50">
          {children}
        </div>
      )}
    </div>
  );
}

function FormField({
  label,
  value,
  field,
  onChange,
  type = 'text',
  placeholder,
}: {
  label: string;
  value: any;
  field: string;
  onChange: (f: string, v: any) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-[11px] font-medium text-bored-gray-400 mb-1.5 uppercase tracking-wider">
        {label}
      </label>
      <input
        type={type}
        value={value ?? ''}
        onChange={(e) =>
          onChange(
            field,
            type === 'number'
              ? e.target.value
                ? Number(e.target.value)
                : null
              : e.target.value
          )
        }
        placeholder={placeholder}
        className="w-full px-3.5 py-2.5 border border-bored-gray-150 rounded-xl text-sm text-bored-black bg-white focus:outline-none focus:ring-2 focus:ring-bored-neon/20 focus:border-bored-gray-300 placeholder:text-bored-gray-300 transition-shadow"
      />
    </div>
  );
}

function FormTextarea({
  label,
  value,
  field,
  onChange,
  rows = 3,
  placeholder,
}: {
  label: string;
  value: any;
  field: string;
  onChange: (f: string, v: any) => void;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-[11px] font-medium text-bored-gray-400 mb-1.5 uppercase tracking-wider">
        {label}
      </label>
      <textarea
        value={value ?? ''}
        onChange={(e) => onChange(field, e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className="w-full px-3.5 py-2.5 border border-bored-gray-150 rounded-xl text-sm text-bored-black bg-white resize-none focus:outline-none focus:ring-2 focus:ring-bored-neon/20 focus:border-bored-gray-300 placeholder:text-bored-gray-300 transition-shadow"
      />
    </div>
  );
}

function FormSelect({
  label,
  value,
  field,
  onChange,
  options,
}: {
  label: string;
  value: any;
  field: string;
  onChange: (f: string, v: any) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label className="block text-[11px] font-medium text-bored-gray-400 mb-1.5 uppercase tracking-wider">
        {label}
      </label>
      <select
        value={value ?? ''}
        onChange={(e) => onChange(field, e.target.value)}
        className="w-full px-3.5 py-2.5 border border-bored-gray-150 rounded-xl text-sm text-bored-black bg-white focus:outline-none focus:ring-2 focus:ring-bored-neon/20 focus:border-bored-gray-300 transition-shadow"
      >
        <option value="">Select...</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function FormToggle({
  label,
  desc,
  value,
  field,
  onChange,
}: {
  label: string;
  desc?: string;
  value: any;
  field: string;
  onChange: (f: string, v: any) => void;
}) {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-bored-gray-50/40 border border-bored-gray-100">
      <div>
        <span className="text-[13px] font-medium text-bored-black">
          {label}
        </span>
        {desc && (
          <p className="text-[10px] text-bored-gray-400 mt-0.5">{desc}</p>
        )}
      </div>
      <button
        onClick={() => onChange(field, !value)}
        className={`relative w-9 h-5 rounded-full transition-colors ${
          value ? 'bg-bored-black' : 'bg-bored-gray-200'
        }`}
      >
        <div
          className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${
            value ? 'left-[18px]' : 'left-0.5'
          }`}
        />
      </button>
    </div>
  );
}

function FormTags({
  label,
  value,
  field,
  onChange,
  placeholder,
  suggestions,
}: {
  label: string;
  value: any;
  field: string;
  onChange: (f: string, v: any) => void;
  placeholder?: string;
  suggestions?: string[];
}) {
  const [input, setInput] = useState('');
  const items: string[] = Array.isArray(value) ? value : [];

  const addItem = (val: string) => {
    const t = val.trim();
    if (t && !items.includes(t)) onChange(field, [...items, t]);
    setInput('');
  };

  return (
    <div>
      <label className="block text-[11px] font-medium text-bored-gray-400 mb-1.5 uppercase tracking-wider">
        {label}
      </label>
      {items.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-1.5">
          {items.map((item, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] bg-bored-gray-50 text-bored-gray-700 border border-bored-gray-100"
            >
              {item}
              <button
                onClick={() =>
                  onChange(
                    field,
                    items.filter((_, j) => j !== i)
                  )
                }
                className="text-bored-gray-400 hover:text-red-500 transition-colors"
              >
                <X size={10} />
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="flex gap-1.5">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addItem(input);
            }
          }}
          placeholder={placeholder}
          className="flex-1 px-3.5 py-2.5 border border-bored-gray-150 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-bored-neon/20 placeholder:text-bored-gray-300"
          list={suggestions ? `s-${field}` : undefined}
        />
        {suggestions && (
          <datalist id={`s-${field}`}>
            {suggestions
              .filter((s) => !items.includes(s))
              .map((s) => (
                <option key={s} value={s} />
              ))}
          </datalist>
        )}
        <button
          onClick={() => addItem(input)}
          disabled={!input.trim()}
          className="px-3 py-2.5 bg-bored-gray-50 border border-bored-gray-100 rounded-xl text-bored-gray-400 hover:bg-bored-gray-100 disabled:opacity-20 transition-colors"
        >
          <Plus size={13} />
        </button>
      </div>
    </div>
  );
}
