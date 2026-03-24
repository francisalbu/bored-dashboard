import React, { useState, useEffect } from 'react';
import {
  Save,
  Palette,
  Globe,
  Eye,
  Users,
  MapPin,
  Plus,
  Trash2,
  Check,
  Loader2,
  ToggleLeft,
  ToggleRight,
  AlertCircle,
  GripVertical,
  MessageSquare,
  Sparkles,
  Package,
  Bot,
  ShieldAlert,
  BookOpen,
  Zap,
  Upload,
  FileText,
  Image,
  ChevronDown,
  ChevronRight,
  Lock,
} from 'lucide-react';
import {
  HotelConfig,
  HotelTheme,
  StaffMember,
  SiteFeatures,
  QuickSuggestion,
  BotConfig,
  KnowledgeEntry,
  BotPersonality,
  SalesAggressiveness,
  ResponseLength,
  DEFAULT_THEME,
  DEFAULT_FEATURES,
  DEFAULT_BOT_CONFIG,
  DEFAULT_QUICK_SUGGESTIONS,
  FONT_OPTIONS,
} from '../../lib/hotelConfigTypes';
import {
  fetchHotelConfig,
  saveHotelConfig,
} from '../../lib/hotelConfigService';
import { useAuth } from '../../lib/authContext';
import { supabase } from '../../lib/supabase';
import {
  ExperienceRow,
  fetchHotelExperiencesOrdered,
  toggleHotelExperienceActive,
  updateHotelExperienceOrder,
} from '../../lib/experienceService';
import { extractTextFromFile, hasOpenAIKey } from '../../lib/fileExtractor';
import { ExperienceRadiusMap } from './ExperienceRadiusMap';

// ─────────────────────────────────────────────────────────────────────────────
// Preview card mock data
// ─────────────────────────────────────────────────────────────────────────────
const PREVIEW_CARDS = [
  { title: 'Sunset Kayak Tour', category: 'Outdoors', price: 45, duration: '2h', rating: '4.9', color: '#3a6b5c' },
  { title: 'Old Town Walk', category: 'Culture', price: 25, duration: '1.5h', rating: '4.8', color: '#7a6b50' },
  { title: 'Surf Lesson', category: 'Sports', price: 55, duration: '2.5h', rating: '4.7', color: '#4a6a8a' },
  { title: 'Wine Tasting', category: 'Food', price: 35, duration: '1h', rating: '4.9', color: '#8a5a5a' },
  { title: 'Dolphin Watching', category: 'Nature', price: 60, duration: '3h', rating: '5.0', color: '#2a5a7a' },
  { title: 'Cooking Class', category: 'Food', price: 40, duration: '2h', rating: '4.6', color: '#6a5a3a' },
];

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

type Section = 'branding' | 'content' | 'features' | 'experiences' | 'ai-bot' | 'staff' | 'account';

interface SiteSettingsViewProps {
  /** Hotel id from auth context — if provided, skips the in-page hotel selector */
  activeHotelId?: string | null;
}

export const SiteSettingsView: React.FC<SiteSettingsViewProps> = ({ activeHotelId }) => {
  const { hotels: authHotels, session: authSession } = useAuth();

  // Only show hotels this user actually has access to (from auth context)
  const hotelIds = authHotels.map(h => ({ id: h.id, name: h.name }));

  const [selectedHotelId, setSelectedHotelId] = useState<string>(
    activeHotelId || authHotels[0]?.id || ''
  );
  const [config, setConfig] = useState<HotelConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [activeSection, setActiveSection] = useState<Section>('branding');

  // Experiences state
  const [experiences, setExperiences] = useState<ExperienceRow[]>([]);
  const [experiencesLoading, setExperiencesLoading] = useState(false);
  const [experiencesSaving, setExperiencesSaving] = useState(false);
  const [experiencesSaveError, setExperiencesSaveError] = useState<string | null>(null);
  const [cityFilter, setCityFilter] = useState<string | null>(null);

  // Radius filter
  const [radiusKm, setRadiusKm] = useState<number>(25);
  const [radiusPreview, setRadiusPreview] = useState<number>(25); // live slider value before apply

  // Password change state
  const [pwCurrent, setPwCurrent] = useState('');
  const [pwNew, setPwNew] = useState('');
  const [pwConfirm, setPwConfirm] = useState('');
  const [pwSaving, setPwSaving] = useState(false);
  const [pwStatus, setPwStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [pwError, setPwError] = useState('');

  // File upload processing state
  const [fileProcessing, setFileProcessing] = useState<Record<string, boolean>>({});
  const [fileDragOver, setFileDragOver] = useState(false);
  const [pendingUploads, setPendingUploads] = useState<KnowledgeEntry[]>([]);
  const [expandedEntryId, setExpandedEntryId] = useState<string | null>(null);

  // Sync selectedHotelId when the prop changes
  useEffect(() => {
    if (activeHotelId) setSelectedHotelId(activeHotelId);
  }, [activeHotelId]);

  // Once authHotels loads (async), make sure selectedHotelId is valid
  useEffect(() => {
    if (!selectedHotelId && authHotels.length > 0) {
      setSelectedHotelId(activeHotelId || authHotels[0].id);
    }
  }, [authHotels]);

  // Load selected hotel config
  useEffect(() => {
    async function loadConfig() {
      setLoading(true);
      const data = await fetchHotelConfig(selectedHotelId);
      if (data) {
        setConfig(data);
      } else {
        setConfig({
          id: selectedHotelId,
          name: '',
          tagline: '',
          location: '',
          logoUrl: '',
          conciergeAvatarUrl: '',
          latitude: null,
          longitude: null,
          subdomain: null,
          theme: { ...DEFAULT_THEME },
          staffMembers: [],
          activityPreferences: { style: 'mixed' },
          features: { ...DEFAULT_FEATURES },
          welcomeTitle: 'Welcome to',
          welcomeSubtitle: '',
          welcomeDescription: "I'm your digital concierge. Ask me anything about the city, or let me find your next adventure.",
          quickSuggestions: [...DEFAULT_QUICK_SUGGESTIONS],
        });
      }
      setLoading(false);
    }
    loadConfig();
  }, [selectedHotelId]);

  // Load experiences ordered by this hotel's per-hotel display_order
  useEffect(() => {
    if (!selectedHotelId) return;
    async function loadExperiences() {
      setExperiencesLoading(true);
      const data = await fetchHotelExperiencesOrdered(selectedHotelId);
      setExperiences(data);

      // Auto-detect which city was previously saved by finding the city
      // whose experiences are mostly active
      const CITY_ALIASES_STATIC: Record<string, string[]> = {
        'Lisboa':           ['lisbon', 'lisboa'],
        'Porto':            ['porto', 'oporto'],
        'Lagos':            ['lagos'],
        'Viana do Castelo': ['viana', 'viana do castelo'],
        'Funchal':          ['funchal'],
      };
      const activeExps = data.filter(e => e.is_active);
      if (activeExps.length > 0) {
        let bestCity: string | null = null;
        let bestCount = 0;
        for (const [city, aliases] of Object.entries(CITY_ALIASES_STATIC)) {
          const count = activeExps.filter(e => {
            const haystack = [(e.city ?? ''), (e.location ?? '')].join(' ').toLowerCase();
            return aliases.some(a => haystack.includes(a));
          }).length;
          if (count > bestCount) { bestCount = count; bestCity = city; }
        }
        // Only set if the dominant city covers at least 50% of active experiences
        if (bestCity && bestCount >= activeExps.length * 0.5) {
          setCityFilter(bestCity);
        }
      }

      setExperiencesLoading(false);
    }
    loadExperiences();
  }, [selectedHotelId]);

  const handleSave = async () => {
    if (!config) return;
    setSaving(true);
    setSaveStatus('idle');
    const result = await saveHotelConfig(config);
    setSaving(false);
    setSaveStatus(result.success ? 'success' : 'error');
    setTimeout(() => setSaveStatus('idle'), 3000);
  };

  const handleSaveExperienceOrder = async (exps?: ExperienceRow[]) => {
    if (!selectedHotelId) return;
    setExperiencesSaving(true);
    setExperiencesSaveError(null);
    const source = exps ?? experiences;
    const orderedIds = source.map((exp, index) => ({
      experienceId: exp.id,
      display_order: index + 1,
      is_active: exp.is_active,
    }));
    const result = await updateHotelExperienceOrder(selectedHotelId, orderedIds);
    setExperiencesSaving(false);
    if (!result.success) {
      console.error('Failed to save experience order:', result.error);
      setExperiencesSaveError(result.error ?? 'Failed to save. Please try again.');
    }
  };

    const handleToggleExperience = async (id: number, currentActive: boolean) => {
    if (!selectedHotelId) return;
    const newActive = !currentActive;
    // Optimistic update
    setExperiences(prev =>
      prev.map(exp => (exp.id === id ? { ...exp, is_active: newActive } : exp))
    );
    const result = await toggleHotelExperienceActive(selectedHotelId, id, newActive);
    if (!result.success) {
      // Revert on failure
      setExperiences(prev =>
        prev.map(exp => (exp.id === id ? { ...exp, is_active: currentActive } : exp))
      );
    }
  };

  // Activate all experiences from a city, deactivate the rest
  // CITY_ALIASES: display label → all possible values in the DB (EN + PT)
  const CITY_ALIASES: Record<string, string[]> = {
    'Lisboa':           ['lisbon', 'lisboa'],
    'Porto':            ['porto', 'oporto'],
    'Lagos':            ['lagos'],
    'Viana do Castelo': ['viana', 'viana do castelo'],
    'Funchal':          ['funchal'],
  };

  const matchesCity = (exp: ExperienceRow, city: string): boolean => {
    const aliases = CITY_ALIASES[city] ?? [city.toLowerCase()];
    const haystack = [
      exp.city?.toLowerCase() ?? '',
      exp.location?.toLowerCase() ?? '',
    ].join(' ');
    return aliases.some(alias => haystack.includes(alias));
  };

  const handleCitySelect = (city: string) => {
    setCityFilter(city);
    setExperiences(prev =>
      prev.map(exp => ({ ...exp, is_active: matchesCity(exp, city) }))
    );
  };

  // Haversine distance in km between two lat/lng points
  const haversineKm = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const withinRadius = (exp: ExperienceRow, km: number): boolean => {
    if (!config?.latitude || !config?.longitude) return true; // no hotel coords → show all
    if (!exp.latitude || !exp.longitude) return true; // no exp coords → include by default
    return haversineKm(config.latitude, config.longitude, exp.latitude, exp.longitude) <= km;
  };

  const handleApplyRadius = (km: number) => {
    setRadiusKm(km);
    setExperiences(prev =>
      prev.map(exp => ({ ...exp, is_active: withinRadius(exp, km) }))
    );
  };

  // Drag-and-drop state
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    setDragIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;
    setDragOverIndex(index);
  };

  const handleDrop = (toIndex: number) => {
    if (dragIndex === null || dragIndex === toIndex) {
      setDragIndex(null);
      setDragOverIndex(null);
      return;
    }

    // The indices come from the rendered list, which may be filtered by cityFilter.
    // We must reorder within that display list and then merge back into the full array.
    const displayList = cityFilter
      ? experiences.filter(e => matchesCity(e, cityFilter))
      : [...experiences];

    const reordered = [...displayList];
    const [dragged] = reordered.splice(dragIndex, 1);
    reordered.splice(toIndex, 0, dragged);

    let updated: ExperienceRow[];
    if (cityFilter) {
      // Replace filtered items in their original positions, keeping unfiltered items intact
      let fi = 0;
      updated = experiences.map(e =>
        matchesCity(e, cityFilter) ? reordered[fi++] : e
      );
    } else {
      updated = reordered;
    }

    setExperiences(updated);
    setDragIndex(null);
    setDragOverIndex(null);
    // Auto-save immediately after drag (pass updated array since state isn't flushed yet)
    handleSaveExperienceOrder(updated);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const updateTheme = (key: keyof HotelTheme, value: string) => {
    if (!config) return;
    setConfig({ ...config, theme: { ...config.theme, [key]: value } });
  };

  const updateFeature = (key: keyof SiteFeatures) => {
    if (!config) return;
    setConfig({ ...config, features: { ...config.features, [key]: !config.features[key] } });
  };

  const addStaffMember = () => {
    if (!config) return;
    setConfig({
      ...config,
      staffMembers: [
        ...config.staffMembers,
        { name: '', role: '', avatar: '', bio: '', preferredCategories: [] },
      ],
    });
  };

  const updateStaffMember = (index: number, field: keyof StaffMember, value: any) => {
    if (!config) return;
    const updated = [...config.staffMembers];
    updated[index] = { ...updated[index], [field]: value };
    setConfig({ ...config, staffMembers: updated });
  };

  const removeStaffMember = (index: number) => {
    if (!config) return;
    setConfig({ ...config, staffMembers: config.staffMembers.filter((_, i) => i !== index) });
  };

  // Quick suggestions helpers
  const addQuickSuggestion = () => {
    if (!config) return;
    setConfig({
      ...config,
      quickSuggestions: [...config.quickSuggestions, { emoji: '✨', label: '', prompt: '' }],
    });
  };

  const updateQuickSuggestion = (index: number, field: keyof QuickSuggestion, value: string) => {
    if (!config) return;
    const updated = [...config.quickSuggestions];
    updated[index] = { ...updated[index], [field]: value };
    setConfig({ ...config, quickSuggestions: updated });
  };

  const removeQuickSuggestion = (index: number) => {
    if (!config) return;
    setConfig({ ...config, quickSuggestions: config.quickSuggestions.filter((_, i) => i !== index) });
  };

  // Bot config helpers
  const updateBotConfig = (key: keyof BotConfig, value: any) => {
    if (!config) return;
    setConfig({ ...config, botConfig: { ...config.botConfig, [key]: value } });
  };

  const updateKnowledgeEntry = (index: number, field: keyof KnowledgeEntry, value: string) => {
    if (!config) return;
    const updated = [...config.botConfig.knowledgeEntries];
    updated[index] = { ...updated[index], [field]: value };
    updateBotConfig('knowledgeEntries', updated);
  };

  // ── File upload → Staging area (pending) ──
  const handleFileUpload = async (files: FileList | File[]) => {
    if (!config) return;
    const fileArr = Array.from(files);

    for (const file of fileArr) {
      const tempId = Date.now().toString() + Math.random().toString(36).slice(2);

      // Guess the entry type from the filename
      const name = file.name.toLowerCase();
      let guessedType: KnowledgeEntry['type'] = 'text';
      if (name.includes('menu') || name.includes('carta') || name.includes('food') || name.includes('drink')) guessedType = 'menu';
      else if (name.includes('policy') || name.includes('polic') || name.includes('regul') || name.includes('terms')) guessedType = 'policy';
      else if (name.includes('service') || name.includes('serviço') || name.includes('ameniti')) guessedType = 'service';
      else if (name.includes('faq') || name.includes('question')) guessedType = 'faq';

      // Create a pending entry
      const pending: KnowledgeEntry = {
        id: tempId,
        title: file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '),
        type: guessedType,
        content: '',
      };
      setPendingUploads(prev => [...prev, pending]);
      setFileProcessing(prev => ({ ...prev, [tempId]: true }));

      try {
        const result = await extractTextFromFile(file);
        setPendingUploads(prev =>
          prev.map(e => e.id === tempId ? { ...e, content: result.text } : e)
        );
      } catch (err: any) {
        setPendingUploads(prev =>
          prev.map(e => e.id === tempId ? { ...e, content: `⚠️ Extraction failed: ${err.message}` } : e)
        );
      } finally {
        setFileProcessing(prev => { const n = { ...prev }; delete n[tempId]; return n; });
      }
    }
  };

  const confirmPendingUpload = (id: string) => {
    const entry = pendingUploads.find(e => e.id === id);
    if (!entry || !config) return;
    updateBotConfig('knowledgeEntries', [...config.botConfig.knowledgeEntries, entry]);
    setPendingUploads(prev => prev.filter(e => e.id !== id));
  };

  const discardPendingUpload = (id: string) => {
    setPendingUploads(prev => prev.filter(e => e.id !== id));
  };

  const handleDropZone = (e: React.DragEvent) => {
    e.preventDefault();
    setFileDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-8 py-12 flex items-center justify-center min-h-[60vh]">
        <div className="flex items-center gap-3 text-bored-gray-500">
          <Loader2 size={24} className="animate-spin" />
          <span className="text-sm font-medium">Loading site settings...</span>
        </div>
      </div>
    );
  }

  if (!config) return null;

  return (
    <div className="max-w-5xl mx-auto px-8">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-light tracking-tight text-bored-black mb-2">
            Site Settings
          </h1>
          <p className="text-sm text-bored-gray-500">
            Customize how your public website looks and behaves. Changes are reflected on refresh.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {saveStatus === 'success' && (
            <span className="flex items-center gap-1.5 text-sm text-emerald-600 font-medium">
              <Check size={16} /> Published!
            </span>
          )}
          {saveStatus === 'error' && (
            <span className="flex items-center gap-1.5 text-sm text-red-500 font-medium">
              <AlertCircle size={16} /> Failed to save
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-bored-black text-white rounded-xl hover:bg-bored-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium shadow-sm"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {saving ? 'Publishing...' : 'Publish Changes'}
          </button>
        </div>
      </div>

      {/* Hotel Selector */}
      {hotelIds.length > 1 && (
        <div className="mb-8">
          <label className="block text-xs font-semibold text-bored-gray-400 uppercase tracking-wider mb-2">
            Hotel
          </label>
          <select
            value={selectedHotelId}
            onChange={e => setSelectedHotelId(e.target.value)}
            className="px-4 py-3 border border-bored-gray-200 rounded-xl text-sm font-medium bg-white w-64"
          >
            {hotelIds.map(h => (
              <option key={h.id} value={h.id}>{h.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Section Nav */}
      <div className="flex gap-2 mb-8 flex-wrap">
        {([
          { key: 'branding' as const, label: 'Branding', icon: <Palette size={16} /> },
          { key: 'content' as const, label: 'Content', icon: <MessageSquare size={16} /> },
          { key: 'experiences' as const, label: 'Experiences', icon: <Package size={16} /> },
          { key: 'ai-bot' as const, label: 'AI Bot', icon: <Bot size={16} /> },
          { key: 'features' as const, label: 'Features', icon: <Eye size={16} /> },
          { key: 'staff' as const, label: 'Staff', icon: <Users size={16} /> },
          { key: 'account' as const, label: 'Account', icon: <Lock size={16} /> },
        ]).map(section => (
          <button
            key={section.key}
            onClick={() => setActiveSection(section.key)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeSection === section.key
                ? 'bg-bored-black text-white shadow-sm'
                : 'bg-white border border-bored-gray-200 text-bored-gray-600 hover:bg-bored-gray-50 hover:text-bored-black'
            }`}
          >
            {section.icon}
            {section.label}
          </button>
        ))}
      </div>

      {/* ── BRANDING SECTION ─────────────────────────────────────────────── */}
      {activeSection === 'branding' && (
        <div className="space-y-8">
          {/* Colors */}
          <div className="bg-white rounded-2xl border border-bored-gray-200 p-8">
            <h2 className="text-lg font-semibold text-bored-black mb-1">Colors</h2>
            <p className="text-sm text-bored-gray-500 mb-6">Define the color palette for your public website</p>
            <div className="grid grid-cols-2 gap-6">
              <ColorPicker label="Primary Color" value={config.theme.primaryColor} onChange={v => updateTheme('primaryColor', v)} />
              <ColorPicker label="Primary Text Color" value={config.theme.primaryTextColor} onChange={v => updateTheme('primaryTextColor', v)} />
              <ColorPicker label="Accent Color" value={config.theme.accentColor} onChange={v => updateTheme('accentColor', v)} />
              <ColorPicker label="Feed Background" sublabel="Activities & main content area" value={config.theme.backgroundColor} onChange={v => updateTheme('backgroundColor', v)} />
              <ColorPicker label="Chat Background" sublabel="Concierge & chat panel" value={config.theme.surfaceColor} onChange={v => updateTheme('surfaceColor', v)} />
            </div>
          </div>

          {/* Typography */}
          <div className="bg-white rounded-2xl border border-bored-gray-200 p-8">
            <h2 className="text-lg font-semibold text-bored-black mb-1">Typography</h2>
            <p className="text-sm text-bored-gray-500 mb-6">Choose fonts for headings and body text</p>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-bored-gray-500 mb-2 uppercase tracking-wide">Heading Font</label>
                <select
                  value={config.theme.fontHeading}
                  onChange={e => updateTheme('fontHeading', e.target.value)}
                  className="w-full px-4 py-3 border border-bored-gray-200 rounded-xl text-sm bg-white"
                >
                  {FONT_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-bored-gray-500 mb-2 uppercase tracking-wide">Body Font</label>
                <select
                  value={config.theme.fontBody}
                  onChange={e => updateTheme('fontBody', e.target.value)}
                  className="w-full px-4 py-3 border border-bored-gray-200 rounded-xl text-sm bg-white"
                >
                  {FONT_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* ── INTERACTIVE SITE PREVIEW ─────────────────────────── */}
          <div className="bg-white rounded-2xl border border-bored-gray-200 p-8">
            <h2 className="text-lg font-semibold text-bored-black mb-1">Live Site Preview</h2>
            <p className="text-sm text-bored-gray-500 mb-6">This is how your website looks with the current settings</p>

            {/* Browser chrome */}
            <div className="rounded-2xl border border-gray-300 overflow-hidden shadow-lg">
              {/* Browser bar */}
              <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 border-b border-gray-200">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 mx-4">
                  <div className="bg-white rounded-md px-3 py-1 text-[11px] text-gray-400 font-mono border border-gray-200">
                    bored.pt/{config.id || 'your-hotel'}
                  </div>
                </div>
              </div>

              {/* Site mockup */}
              <div className="flex" style={{ fontFamily: `'${config.theme.fontBody}', sans-serif`, height: 480 }}>

                {/* LEFT: Chat Panel — uses Surface Color */}
                <div className="w-[38%] border-r flex flex-col" style={{ backgroundColor: config.theme.surfaceColor, borderColor: `${config.theme.primaryColor}10` }}>
                  <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-8 space-y-4">
                    {/* Avatar */}
                    <div className="w-20 h-20 rounded-2xl overflow-hidden border flex items-center justify-center" style={{ borderColor: `${config.theme.primaryColor}15`, backgroundColor: config.theme.surfaceColor }}>
                      {config.conciergeAvatarUrl ? (
                        <img src={config.conciergeAvatarUrl} alt="" className="w-full h-full object-cover" />
                      ) : config.logoUrl ? (
                        <img src={config.logoUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-2xl font-bold" style={{ color: config.theme.primaryColor }}>{config.name?.charAt(0) || 'H'}</span>
                      )}
                    </div>
                    {/* Welcome text */}
                    <div>
                      <h3 className="text-xl font-light tracking-tight leading-tight" style={{ fontFamily: `'${config.theme.fontHeading}', sans-serif`, color: config.theme.primaryColor }}>
                        {config.welcomeTitle || 'Welcome to'} <br />
                        <span className="italic">{config.welcomeSubtitle || config.name}</span>
                      </h3>
                      <p className="text-xs mt-2 leading-relaxed opacity-60" style={{ color: config.theme.primaryColor }}>
                        {config.welcomeDescription ? config.welcomeDescription.slice(0, 80) + '...' : "I'm your digital concierge..."}
                      </p>
                    </div>
                    {/* Quick suggestions */}
                    <div className="flex flex-wrap gap-1.5 justify-center mt-2">
                      {(config.quickSuggestions || []).slice(0, 3).map((s, i) => (
                        <span key={i} className="px-3 py-1.5 rounded-full text-[9px] font-medium border" style={{ borderColor: `${config.theme.primaryColor}15`, color: config.theme.primaryColor, backgroundColor: config.theme.surfaceColor }}>
                          {s.emoji} {s.label}
                        </span>
                      ))}
                    </div>
                  </div>
                  {/* Chat input */}
                  <div className="p-3 border-t" style={{ borderColor: `${config.theme.primaryColor}10` }}>
                    <div className="rounded-full border px-4 py-2 text-[10px] opacity-40" style={{ borderColor: `${config.theme.primaryColor}20`, color: config.theme.primaryColor }}>
                      What do you want to do?
                    </div>
                  </div>
                </div>

                {/* RIGHT: Main Feed — uses Background Color */}
                <div className="flex-1 flex flex-col overflow-hidden" style={{ backgroundColor: config.theme.backgroundColor }}>
                  {/* Header */}
                  <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: `${config.theme.primaryColor}08` }}>
                    <div>
                      <div className="text-[8px] uppercase tracking-[0.3em] opacity-40 mb-0.5" style={{ color: config.theme.primaryColor, fontFamily: `'${config.theme.fontBody}', sans-serif` }}>
                        {config.tagline || 'DISCOVER'}
                      </div>
                      <div className="text-lg font-light tracking-tight" style={{ color: config.theme.primaryColor, fontFamily: `'${config.theme.fontHeading}', sans-serif` }}>
                        {config.location || 'Your Location'}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <span className="px-3 py-1.5 rounded-full text-[9px] font-medium border" style={{ borderColor: `${config.theme.primaryColor}15`, color: config.theme.primaryColor, backgroundColor: config.theme.surfaceColor }}>
                        Pre-Arrival
                      </span>
                      <span className="px-3 py-1.5 rounded-full text-[9px] font-medium border" style={{ borderColor: `${config.theme.primaryColor}15`, color: config.theme.primaryColor, backgroundColor: config.theme.surfaceColor }}>
                        Hotel Picks
                      </span>
                    </div>
                  </div>

                  {/* Category Pills */}
                  <div className="px-5 py-3 flex gap-2 border-b" style={{ borderColor: `${config.theme.primaryColor}05` }}>
                    {['🔥 All', '🏞️ Outdoors', '⚽ Sports', '🎭 Culture'].map((cat, i) => (
                      <span key={cat} className="px-3 py-1.5 rounded-full text-[9px] font-medium whitespace-nowrap transition-all" style={i === 0 ? { backgroundColor: config.theme.primaryColor, color: config.theme.primaryTextColor } : { backgroundColor: config.theme.surfaceColor, color: config.theme.primaryColor, border: `1px solid ${config.theme.primaryColor}12` }}>
                        {cat}
                      </span>
                    ))}
                  </div>

                  {/* Section title */}
                  <div className="px-5 pt-4 pb-2 flex items-center gap-2">
                    <span className="text-base font-light tracking-tight" style={{ color: config.theme.primaryColor, fontFamily: `'${config.theme.fontHeading}', sans-serif` }}>
                      Today's Inspiration
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-medium" style={{ backgroundColor: `${config.theme.primaryColor}08`, color: config.theme.primaryColor }}>
                      39
                    </span>
                  </div>

                  {/* Experience Cards Grid */}
                  <div className="flex-1 px-5 pb-4 overflow-hidden">
                    <div className="grid grid-cols-3 gap-2.5">
                      {PREVIEW_CARDS.map((card, i) => (
                        <div key={i} className="rounded-xl overflow-hidden relative" style={{ aspectRatio: '3/4' }}>
                          {/* Placeholder image */}
                          <div className="absolute inset-0" style={{ backgroundColor: card.color }} />
                          {/* Category badge */}
                          <div className="absolute top-2 left-2">
                            <span className="px-2 py-0.5 rounded-md text-[7px] font-bold uppercase tracking-wider" style={{ backgroundColor: config.theme.primaryColor, color: config.theme.primaryTextColor }}>
                              {card.category}
                            </span>
                          </div>
                          {/* Bottom info */}
                          <div className="absolute bottom-0 left-0 right-0 p-2.5 bg-gradient-to-t from-black/60 to-transparent">
                            <div className="text-[8px] font-bold text-white uppercase tracking-wide leading-tight">{card.title}</div>
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-[7px] text-white/70">⏱ {card.duration} · ⭐ {card.rating}</span>
                              <div className="flex items-center gap-1.5">
                                <span className="text-[9px] font-bold text-white">EUR{card.price}</span>
                                <span className="text-[7px] px-1.5 py-0.5 rounded font-medium" style={{ backgroundColor: config.theme.accentColor, color: '#fff' }}>BOOK</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Color Legend */}
            <div className="mt-6 flex flex-wrap gap-3">
              {[
                { label: 'Feed Background', color: config.theme.backgroundColor },
                { label: 'Chat Background', color: config.theme.surfaceColor },
                { label: 'Primary', color: config.theme.primaryColor },
                { label: 'Primary Text', color: config.theme.primaryTextColor },
                { label: 'Accent', color: config.theme.accentColor },
              ].map(({ label, color }) => (
                <div key={label} className="flex items-center gap-2 text-xs text-bored-gray-500">
                  <div className="w-4 h-4 rounded-md border border-gray-200" style={{ backgroundColor: color }} />
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── CONTENT SECTION ──────────────────────────────────────────────── */}
      {activeSection === 'content' && (
        <div className="space-y-8">
          {/* General Info */}
          <div className="bg-white rounded-2xl border border-bored-gray-200 p-8">
            <h2 className="text-lg font-semibold text-bored-black mb-1">General Information</h2>
            <p className="text-sm text-bored-gray-500 mb-6">Basic details shown on your public website</p>
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-6">
                <InputField label="Hotel Name" value={config.name} onChange={v => setConfig({ ...config, name: v })} />
                <InputField label="Tagline" value={config.tagline} placeholder="e.g. DISCOVER" onChange={v => setConfig({ ...config, tagline: v })} />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <InputField label="Location" value={config.location} placeholder="e.g. Lisbon & Surroundings" onChange={v => setConfig({ ...config, location: v })} icon={<MapPin size={16} />} />
                <InputField label="Latitude" value={config.latitude ? String(config.latitude) : ''} type="number" placeholder="38.7170" onChange={v => setConfig({ ...config, latitude: v ? Number(v) : null })} />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <InputField label="Longitude" value={config.longitude ? String(config.longitude) : ''} type="number" placeholder="-9.1383" onChange={v => setConfig({ ...config, longitude: v ? Number(v) : null })} />
              </div>
            </div>
          </div>

          {/* Media */}
          <div className="bg-white rounded-2xl border border-bored-gray-200 p-8">
            <h2 className="text-lg font-semibold text-bored-black mb-1">Media</h2>
            <p className="text-sm text-bored-gray-500 mb-6">Logo and avatar shown on the website</p>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-bored-gray-500 mb-2 uppercase tracking-wide">Logo URL</label>
                <div className="flex gap-3">
                  <input type="text" value={config.logoUrl} onChange={e => setConfig({ ...config, logoUrl: e.target.value })} placeholder="https://..." className="flex-1 px-4 py-3 border border-bored-gray-200 rounded-xl text-sm" />
                  {config.logoUrl && <img src={config.logoUrl} alt="Logo" className="w-12 h-12 rounded-xl object-cover border border-bored-gray-200" />}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-bored-gray-500 mb-2 uppercase tracking-wide">Concierge Avatar URL</label>
                <div className="flex gap-3">
                  <input type="text" value={config.conciergeAvatarUrl} onChange={e => setConfig({ ...config, conciergeAvatarUrl: e.target.value })} placeholder="https://..." className="flex-1 px-4 py-3 border border-bored-gray-200 rounded-xl text-sm" />
                  {config.conciergeAvatarUrl && <img src={config.conciergeAvatarUrl} alt="Avatar" className="w-12 h-12 rounded-full object-cover border border-bored-gray-200" />}
                </div>
              </div>
            </div>
          </div>

          {/* Welcome / Concierge Message */}
          <div className="bg-white rounded-2xl border border-bored-gray-200 p-8">
            <div className="flex items-center gap-3 mb-1">
              <Sparkles size={20} className="text-bored-gray-800" />
              <h2 className="text-lg font-semibold text-bored-black">Welcome Message</h2>
            </div>
            <p className="text-sm text-bored-gray-500 mb-6">
              The greeting shown on the concierge chat before the guest sends a message
            </p>
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-6">
                <InputField
                  label="Title"
                  value={config.welcomeTitle}
                  placeholder="Welcome to"
                  onChange={v => setConfig({ ...config, welcomeTitle: v })}
                />
                <InputField
                  label="Subtitle (hotel name)"
                  value={config.welcomeSubtitle}
                  placeholder="Vila Gale Opera"
                  onChange={v => setConfig({ ...config, welcomeSubtitle: v })}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-bored-gray-500 mb-2 uppercase tracking-wide">Description</label>
                <textarea
                  value={config.welcomeDescription}
                  onChange={e => setConfig({ ...config, welcomeDescription: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-bored-gray-200 rounded-xl text-sm resize-none"
                  placeholder="I'm your digital concierge..."
                />
              </div>
            </div>

            {/* Live Preview */}
            <div className="mt-6 p-6 bg-slate-50 rounded-xl border border-slate-200">
              <p className="text-xs font-semibold text-bored-gray-400 uppercase tracking-wider mb-4">Preview</p>
              <div className="text-center space-y-3">
                {config.conciergeAvatarUrl && (
                  <img src={config.conciergeAvatarUrl} alt="" className="w-20 h-20 rounded-2xl mx-auto object-cover border border-slate-200" />
                )}
                <h3 className="text-2xl text-slate-900 font-light tracking-tight leading-tight">
                  {config.welcomeTitle || 'Welcome to'} <br />
                  <span className="font-serif italic">{config.welcomeSubtitle || config.name}</span>
                </h3>
                <p className="text-slate-600 font-light max-w-md mx-auto text-sm leading-relaxed">
                  {config.welcomeDescription}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Suggestions */}
          <div className="bg-white rounded-2xl border border-bored-gray-200 p-8">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-lg font-semibold text-bored-black">Quick Suggestions</h2>
              <button
                onClick={addQuickSuggestion}
                className="flex items-center gap-2 px-4 py-2 bg-bored-black text-white rounded-xl text-sm font-medium hover:bg-bored-gray-800 transition-colors"
              >
                <Plus size={14} />
                Add
              </button>
            </div>
            <p className="text-sm text-bored-gray-500 mb-6">
              Buttons shown below the welcome message — guests click these to start a conversation
            </p>

            {config.quickSuggestions.length === 0 && (
              <div className="text-center py-8 text-bored-gray-400 text-sm">
                No suggestions yet. Add one above.
              </div>
            )}

            <div className="space-y-3">
              {config.quickSuggestions.map((sug, index) => (
                <div key={index} className="flex items-center gap-3 group">
                  <input
                    type="text"
                    value={sug.emoji}
                    onChange={e => updateQuickSuggestion(index, 'emoji', e.target.value)}
                    className="w-14 px-2 py-2.5 border border-bored-gray-200 rounded-xl text-center text-lg"
                    placeholder="🔥"
                  />
                  <input
                    type="text"
                    value={sug.label}
                    onChange={e => updateQuickSuggestion(index, 'label', e.target.value)}
                    className="w-48 px-4 py-2.5 border border-bored-gray-200 rounded-xl text-sm"
                    placeholder="Button label"
                  />
                  <input
                    type="text"
                    value={sug.prompt}
                    onChange={e => updateQuickSuggestion(index, 'prompt', e.target.value)}
                    className="flex-1 px-4 py-2.5 border border-bored-gray-200 rounded-xl text-sm"
                    placeholder="Message sent when clicked..."
                  />
                  <button
                    onClick={() => removeQuickSuggestion(index)}
                    className="p-2 text-bored-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>

            {/* Preview */}
            {config.quickSuggestions.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2 justify-center p-4 bg-slate-50 rounded-xl">
                {config.quickSuggestions.map((sug, i) => (
                  <span key={i} className="px-5 py-2 bg-white border border-slate-200 rounded-full text-xs font-medium text-slate-600">
                    {sug.emoji} {sug.label}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── EXPERIENCES SECTION ───────────────────────────────────────────── */}
      {activeSection === 'experiences' && (
        <div className="space-y-8">
          <div className="bg-white rounded-2xl border border-bored-gray-200 p-8">
            <div className="flex items-center justify-between mb-1">
              <div>
                <h2 className="text-lg font-semibold text-bored-black">Experiences</h2>
                <p className="text-sm text-bored-gray-500 mt-1">
                  Toggle visibility and reorder how experiences appear on the public website
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <button
                  onClick={() => handleSaveExperienceOrder()}
                  disabled={experiencesSaving}
                  className="flex items-center gap-2 px-5 py-2.5 bg-bored-black text-white rounded-xl text-sm font-medium hover:bg-bored-gray-800 transition-colors disabled:opacity-50"
                >
                  {experiencesSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  {experiencesSaving ? 'Saving…' : 'Save Order'}
                </button>
                {experiencesSaveError && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle size={12} /> {experiencesSaveError}
                  </p>
                )}
              </div>
            </div>

            {/* ── City / Radius / Map filter ───────────────────────────── */}
            {(() => {
              const CITIES = ['Lisboa', 'Porto', 'Lagos', 'Viana do Castelo', 'Funchal'];
              const hasCoords = !!(config?.latitude && config?.longitude);
              const cityExps = cityFilter ? experiences.filter(e => matchesCity(e, cityFilter)) : experiences;
              const active   = cityExps.filter(e => e.is_active).length;
              const hidden   = cityExps.filter(e => !e.is_active).length;
              const total    = cityExps.length;

              return (
                <div className="mt-6 mb-6 space-y-4">

                  {/* ── Top row: city selector + stats pill ── */}
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex-1 min-w-[220px]">
                      <label className="block text-xs font-semibold text-bored-gray-500 mb-1.5 uppercase tracking-wide">Hotel city</label>
                      <select
                        value={cityFilter || ''}
                        onChange={async e => {
                          const city = e.target.value || null;
                          setCityFilter(city);
                          if (city) {
                            const updated = experiences.map(exp => ({
                              ...exp,
                              is_active: matchesCity(exp, city) && (!hasCoords || withinRadius(exp, radiusPreview)),
                            }));
                            setExperiences(updated);
                            await handleSaveExperienceOrder(updated);
                          }
                        }}
                        className="w-full px-4 py-2.5 border border-bored-gray-200 rounded-xl text-sm font-medium bg-white cursor-pointer"
                      >
                        <option value="">— Select city —</option>
                        {CITIES.map(city => {
                          const n = experiences.filter(e => matchesCity(e, city)).length;
                          return n > 0 ? <option key={city} value={city}>{city} ({n})</option> : null;
                        })}
                      </select>
                    </div>

                    {/* Stats — one single source of truth */}
                    {cityFilter && (
                      <div className="flex items-center gap-3 pt-5">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 rounded-lg">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                          <span className="text-sm font-semibold text-emerald-700">{active} visible</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-lg">
                          <span className="w-2 h-2 rounded-full bg-slate-400 inline-block"></span>
                          <span className="text-sm font-medium text-slate-500">{hidden} hidden</span>
                        </div>
                        <div className="text-xs text-bored-gray-400">{total} total in {cityFilter}</div>
                      </div>
                    )}
                  </div>

                  {/* ── Radius slider (only when hotel has coordinates) ── */}
                  {hasCoords && cityFilter && (
                    <div className="bg-bored-gray-50 rounded-xl p-5">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-sm font-semibold text-bored-black">Radius filter</p>
                          <p className="text-xs text-bored-gray-400 mt-0.5">Only show experiences within this distance from the hotel</p>
                        </div>
                        <span className="text-2xl font-bold text-bored-black tabular-nums">{radiusPreview} <span className="text-sm font-medium text-bored-gray-400">km</span></span>
                      </div>
                      <input
                        type="range"
                        min={5}
                        max={150}
                        step={5}
                        value={radiusPreview}
                        onChange={e => {
                          const km = Number(e.target.value);
                          setRadiusPreview(km);
                          setExperiences(prev =>
                            prev.map(exp => ({
                              ...exp,
                              is_active: matchesCity(exp, cityFilter) && withinRadius(exp, km),
                            }))
                          );
                        }}
                        onMouseUp={async e => {
                          // Auto-save when user releases slider
                          const km = Number((e.target as HTMLInputElement).value);
                          setRadiusKm(km);
                          const updated = experiences.map(exp => ({
                            ...exp,
                            is_active: matchesCity(exp, cityFilter) && withinRadius(exp, km),
                          }));
                          setExperiences(updated);
                          await handleSaveExperienceOrder(updated);
                        }}
                        className="w-full h-2 rounded-full accent-bored-black cursor-pointer"
                      />
                      <div className="flex justify-between mt-1.5">
                        <span className="text-[11px] text-bored-gray-400">5 km</span>
                        <span className="text-[11px] text-bored-gray-400">150 km</span>
                      </div>
                    </div>
                  )}

                  {/* ── Map ── */}
                  {hasCoords && cityFilter && (
                    <ExperienceRadiusMap
                      hotelLat={config!.latitude!}
                      hotelLng={config!.longitude!}
                      hotelName={config!.name}
                      radiusKm={radiusPreview}
                      experiences={experiences}
                      cityFilter={cityFilter}
                    />
                  )}

                  {hasCoords && !cityFilter && (
                    <div className="rounded-xl bg-bored-gray-50 border border-dashed border-bored-gray-200 px-6 py-5 text-sm text-bored-gray-400 text-center">
                      Select a city above to see the radius map and filter by distance
                    </div>
                  )}

                  {/* Save status */}
                  {cityFilter && (
                    <p className="text-xs text-bored-gray-400 text-right">
                      {experiencesSaving ? '⏳ Saving...' : '✓ Changes saved automatically'}
                    </p>
                  )}
                </div>
              );
            })()}

            {experiencesLoading ? (
              <div className="flex items-center justify-center py-12 text-bored-gray-500">
                <Loader2 size={24} className="animate-spin mr-2" />
                Loading experiences...
              </div>
            ) : experiences.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-2xl bg-bored-gray-100 flex items-center justify-center mb-4">
                  <Package size={28} className="text-bored-gray-400" />
                </div>
                <h3 className="text-sm font-semibold text-bored-black mb-1">No experiences in your catalog yet</h3>
                <p className="text-xs text-bored-gray-400 max-w-xs">
                  Go to <strong>Catalog</strong> to add experiences from the marketplace to this hotel's catalog. Once added, you can reorder and toggle their visibility here.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {(cityFilter
                  ? experiences.filter(e => matchesCity(e, cityFilter))
                  : experiences
                ).map((exp, index) => (
                  <div
                    key={exp.id}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDrop={() => handleDrop(index)}
                    onDragEnd={handleDragEnd}
                    className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                      dragIndex === index
                        ? 'opacity-40 scale-[0.98] border-dashed border-bored-gray-300 bg-bored-gray-50'
                        : dragOverIndex === index
                        ? 'border-bored-neon bg-yellow-50/40 shadow-sm'
                        : exp.is_active
                        ? 'bg-white border-bored-gray-200 hover:shadow-sm'
                        : 'bg-slate-50 border-slate-200 opacity-60'
                    }`}
                  >
                    {/* Drag handle */}
                    <div className="cursor-grab active:cursor-grabbing p-1 text-bored-gray-300 hover:text-bored-gray-500 transition-colors">
                      <GripVertical size={18} />
                    </div>

                    {/* Order number */}
                    <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-bored-gray-100 text-xs font-bold text-bored-gray-500">
                      {index + 1}
                    </span>

                    {/* Image */}
                    {exp.image_url ? (
                      <img
                        src={exp.images?.[0] || exp.image_url}
                        alt={exp.title}
                        className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-bored-gray-100 flex items-center justify-center flex-shrink-0">
                        <Package size={20} className="text-bored-gray-400" />
                      </div>
                    )}

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-bored-black truncate">{exp.title}</h3>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-xs text-bored-gray-500">{exp.category}</span>
                        <span className="text-xs font-medium text-bored-black">{exp.currency} {exp.price}</span>
                        {exp.duration && <span className="text-xs text-bored-gray-400">{exp.duration}</span>}
                      </div>
                    </div>

                    {/* Toggle */}
                    <button
                      onClick={() => handleToggleExperience(exp.id, exp.is_active)}
                      className={`transition-colors flex-shrink-0 ${exp.is_active ? 'text-emerald-500' : 'text-bored-gray-300'}`}
                    >
                      {exp.is_active ? <ToggleRight size={36} /> : <ToggleLeft size={36} />}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── AI BOT SECTION ───────────────────────────────────────────────── */}
      {activeSection === 'ai-bot' && (
        <div className="space-y-8">

          {/* Personality & Tone */}
          <div className="bg-white rounded-2xl border border-bored-gray-200 p-8">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                <Sparkles size={16} className="text-purple-600" />
              </div>
              <h2 className="text-lg font-semibold text-bored-black">Personality & Tone</h2>
            </div>
            <p className="text-sm text-bored-gray-500 mb-6 ml-11">Define how your AI concierge communicates with guests</p>

            <div className="grid grid-cols-2 gap-6 mb-6">
              <InputField label="Bot Name" value={config.botConfig.botName} onChange={v => updateBotConfig('botName', v)} placeholder="e.g. Sofia, Concierge, Miguel" />
              <div>
                <label className="block text-xs font-semibold text-bored-gray-500 mb-2 uppercase tracking-wide">Language</label>
                <select value={config.botConfig.language} onChange={e => updateBotConfig('language', e.target.value)} className="w-full px-4 py-3 border border-bored-gray-200 rounded-xl text-sm bg-white">
                  <option value="auto">Auto-detect (responds in guest's language)</option>
                  <option value="pt">Português</option>
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                  <option value="de">Deutsch</option>
                  <option value="it">Italiano</option>
                </select>
              </div>
            </div>

            {/* Personality Selector */}
            <div className="mb-6">
              <label className="block text-xs font-semibold text-bored-gray-500 mb-3 uppercase tracking-wide">Personality Style</label>
              <div className="grid grid-cols-5 gap-3">
                {([
                  { key: 'premium' as BotPersonality, label: 'Premium', emoji: '✨', desc: 'Elegant and sophisticated' },
                  { key: 'friendly' as BotPersonality, label: 'Friendly', emoji: '😊', desc: 'Warm and approachable' },
                  { key: 'casual' as BotPersonality, label: 'Casual', emoji: '🤙', desc: 'Relaxed and fun' },
                  { key: 'professional' as BotPersonality, label: 'Professional', emoji: '💼', desc: 'Formal and efficient' },
                  { key: 'adventurous' as BotPersonality, label: 'Adventurous', emoji: '🌍', desc: 'Energetic explorer' },
                ]).map(p => (
                  <button
                    key={p.key}
                    onClick={() => updateBotConfig('personality', p.key)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      config.botConfig.personality === p.key
                        ? 'border-bored-neon bg-bored-neon/5 shadow-sm'
                        : 'border-bored-gray-200 hover:border-bored-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-2">{p.emoji}</div>
                    <div className="text-sm font-semibold text-bored-black">{p.label}</div>
                    <div className="text-[11px] text-bored-gray-500 mt-0.5">{p.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Tone Description */}
            <div>
              <label className="block text-xs font-semibold text-bored-gray-500 mb-2 uppercase tracking-wide">Tone Description</label>
              <textarea
                value={config.botConfig.toneDescription}
                onChange={e => updateBotConfig('toneDescription', e.target.value)}
                placeholder="e.g. Warm and knowledgeable, like a trusted local friend who works at a luxury hotel. Uses occasional Portuguese words for charm."
                className="w-full px-4 py-3 border border-bored-gray-200 rounded-xl text-sm resize-none h-24"
              />
              <p className="text-[11px] text-bored-gray-400 mt-1">Describe the exact tone you want — this overrides the personality style above for more control</p>
            </div>
          </div>

          {/* Sales Behavior */}
          <div className="bg-white rounded-2xl border border-bored-gray-200 p-8">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                <Zap size={16} className="text-amber-600" />
              </div>
              <h2 className="text-lg font-semibold text-bored-black">Sales Behavior</h2>
            </div>
            <p className="text-sm text-bored-gray-500 mb-6 ml-11">Control how aggressively the bot sells experiences</p>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-bored-gray-500 mb-3 uppercase tracking-wide">Sales Aggressiveness</label>
                <div className="flex gap-3">
                  {([
                    { key: 'soft' as SalesAggressiveness, label: 'Soft', desc: 'Suggests only when asked' },
                    { key: 'balanced' as SalesAggressiveness, label: 'Balanced', desc: 'Naturally weaves in recommendations' },
                    { key: 'aggressive' as SalesAggressiveness, label: 'Pushy', desc: 'Maximizes sales opportunities' },
                  ]).map(s => (
                    <button
                      key={s.key}
                      onClick={() => updateBotConfig('salesAggressiveness', s.key)}
                      className={`flex-1 p-3 rounded-xl border-2 text-center transition-all ${
                        config.botConfig.salesAggressiveness === s.key
                          ? 'border-bored-neon bg-bored-neon/5'
                          : 'border-bored-gray-200 hover:border-bored-gray-300'
                      }`}
                    >
                      <div className="text-sm font-semibold text-bored-black">{s.label}</div>
                      <div className="text-[10px] text-bored-gray-500 mt-0.5">{s.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-bored-gray-500 mb-3 uppercase tracking-wide">Response Length</label>
                <div className="flex gap-3">
                  {([
                    { key: 'short' as ResponseLength, label: 'Short', desc: '1-2 sentences' },
                    { key: 'medium' as ResponseLength, label: 'Medium', desc: '2-4 sentences' },
                    { key: 'long' as ResponseLength, label: 'Detailed', desc: 'Full paragraphs' },
                  ]).map(r => (
                    <button
                      key={r.key}
                      onClick={() => updateBotConfig('maxResponseLength', r.key)}
                      className={`flex-1 p-3 rounded-xl border-2 text-center transition-all ${
                        config.botConfig.maxResponseLength === r.key
                          ? 'border-bored-neon bg-bored-neon/5'
                          : 'border-bored-gray-200 hover:border-bored-gray-300'
                      }`}
                    >
                      <div className="text-sm font-semibold text-bored-black">{r.label}</div>
                      <div className="text-[10px] text-bored-gray-500 mt-0.5">{r.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Custom Instructions */}
          <div className="bg-white rounded-2xl border border-bored-gray-200 p-8">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                <MessageSquare size={16} className="text-blue-600" />
              </div>
              <h2 className="text-lg font-semibold text-bored-black">Custom Instructions</h2>
            </div>
            <p className="text-sm text-bored-gray-500 mb-6 ml-11">Specific instructions the bot should always follow</p>

            <textarea
              value={config.botConfig.customInstructions}
              onChange={e => updateBotConfig('customInstructions', e.target.value)}
              placeholder={"e.g.\n• Always mention our spa after recommending outdoor activities\n• If the guest asks about restaurants, suggest our in-house restaurant first\n• Never recommend competitor hotels\n• Mention the breakfast buffet is included for all guests\n• For families, always suggest the kids club"}
              className="w-full px-4 py-3 border border-bored-gray-200 rounded-xl text-sm resize-none h-40 font-mono"
            />
            <p className="text-[11px] text-bored-gray-400 mt-2">These instructions are injected directly into the bot's system prompt. Be specific!</p>
          </div>

          {/* Restrictions */}
          <div className="bg-white rounded-2xl border border-bored-gray-200 p-8">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                <ShieldAlert size={16} className="text-red-600" />
              </div>
              <h2 className="text-lg font-semibold text-bored-black">Restrictions</h2>
            </div>
            <p className="text-sm text-bored-gray-500 mb-6 ml-11">Things the bot should never recommend or mention</p>

            <div className="space-y-3 mb-4">
              {config.botConfig.restrictions.map((restriction, i) => (
                <div key={i} className="flex items-center gap-3 group">
                  <ShieldAlert size={14} className="text-red-400 flex-shrink-0" />
                  <input
                    type="text"
                    value={restriction}
                    onChange={e => {
                      const updated = [...config.botConfig.restrictions];
                      updated[i] = e.target.value;
                      updateBotConfig('restrictions', updated);
                    }}
                    className="flex-1 px-4 py-2.5 border border-bored-gray-200 rounded-xl text-sm"
                    placeholder="e.g. Don't recommend competitor hotel X"
                  />
                  <button
                    onClick={() => {
                      const updated = config.botConfig.restrictions.filter((_, j) => j !== i);
                      updateBotConfig('restrictions', updated);
                    }}
                    className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={() => updateBotConfig('restrictions', [...config.botConfig.restrictions, ''])}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border border-dashed border-bored-gray-300 text-bored-gray-500 hover:border-bored-gray-400 hover:text-bored-gray-700 transition-colors"
            >
              <Plus size={16} /> Add Restriction
            </button>
          </div>

          {/* Knowledge Base */}
          <div className="bg-white rounded-2xl border border-bored-gray-200 p-8">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                <BookOpen size={16} className="text-emerald-600" />
              </div>
              <h2 className="text-lg font-semibold text-bored-black">Knowledge Base</h2>
              {config.botConfig.knowledgeEntries.length > 0 && (
                <span className="ml-auto text-xs text-bored-gray-400 font-medium">
                  {config.botConfig.knowledgeEntries.length} {config.botConfig.knowledgeEntries.length === 1 ? 'entry' : 'entries'}
                </span>
              )}
            </div>
            <p className="text-sm text-bored-gray-500 mb-6 ml-11">Upload PDFs, images, or add info manually — the bot uses this to answer guest questions</p>

            {/* ── Drop Zone ── */}
            <div
              onDragOver={e => { e.preventDefault(); setFileDragOver(true); }}
              onDragLeave={() => setFileDragOver(false)}
              onDrop={handleDropZone}
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.multiple = true;
                input.accept = '.pdf,.png,.jpg,.jpeg,.webp,.txt,.md';
                input.onchange = (e) => {
                  const files = (e.target as HTMLInputElement).files;
                  if (files) handleFileUpload(files);
                };
                input.click();
              }}
              className={`mb-6 border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                fileDragOver
                  ? 'border-emerald-400 bg-emerald-50 scale-[1.01]'
                  : 'border-bored-gray-200 hover:border-bored-gray-400 hover:bg-bored-gray-50/50'
              }`}
            >
              <Upload size={20} className="text-emerald-500 mx-auto mb-2" />
              <p className="text-sm font-semibold text-bored-black mb-0.5">
                {fileDragOver ? 'Drop files here!' : 'Drop files or click to upload'}
              </p>
              <p className="text-[11px] text-bored-gray-400">
                PDF, images (PNG, JPG) or text — content extracted automatically
              </p>
            </div>

            {/* ── Pending Uploads (staging area) ── */}
            {pendingUploads.length > 0 && (
              <div className="mb-6 space-y-3">
                <div className="text-xs font-semibold text-amber-600 uppercase tracking-wide flex items-center gap-2">
                  <AlertCircle size={13} /> Pending — review & add
                </div>
                {pendingUploads.map((pending) => {
                  const isProcessing = fileProcessing[pending.id];
                  return (
                    <div key={pending.id} className="border-2 border-amber-200 bg-amber-50/50 rounded-xl p-5">
                      {isProcessing ? (
                        <div className="flex items-center gap-3 py-4 justify-center">
                          <Loader2 size={18} className="animate-spin text-amber-500" />
                          <span className="text-sm text-amber-600 font-medium">Reading file...</span>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-3 mb-3">
                            <select
                              value={pending.type}
                              onChange={e => setPendingUploads(prev => prev.map(p => p.id === pending.id ? { ...p, type: e.target.value as KnowledgeEntry['type'] } : p))}
                              className="px-3 py-2 border border-amber-200 rounded-lg text-xs font-medium bg-white"
                            >
                              <option value="text">📝 General Info</option>
                              <option value="menu">🍽️ Menu / F&B</option>
                              <option value="policy">📋 Policy</option>
                              <option value="service">🛎️ Service</option>
                              <option value="faq">❓ FAQ</option>
                            </select>
                            <input
                              type="text"
                              value={pending.title}
                              onChange={e => setPendingUploads(prev => prev.map(p => p.id === pending.id ? { ...p, title: e.target.value } : p))}
                              className="flex-1 px-4 py-2 border border-amber-200 rounded-lg text-sm font-medium bg-white"
                              placeholder="Entry title"
                            />
                          </div>
                          {/* Preview (read-only, truncated) */}
                          <div className="bg-white border border-amber-200 rounded-xl p-4 mb-3 max-h-32 overflow-y-auto">
                            <pre className="text-xs text-bored-gray-600 whitespace-pre-wrap font-mono leading-relaxed">
                              {pending.content.slice(0, 800)}{pending.content.length > 800 ? '\n...' : ''}
                            </pre>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-bored-gray-400">{pending.content.length.toLocaleString()} characters extracted</span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => discardPendingUpload(pending.id)}
                                className="px-4 py-2 rounded-lg text-xs font-medium text-bored-gray-500 hover:bg-bored-gray-100 transition-colors"
                              >
                                Discard
                              </button>
                              <button
                                onClick={() => confirmPendingUpload(pending.id)}
                                className="px-5 py-2 rounded-lg text-xs font-semibold bg-emerald-500 text-white hover:bg-emerald-600 transition-colors flex items-center gap-1.5"
                              >
                                <Plus size={14} /> Add to Knowledge Base
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── Saved Entries (collapsed cards) ── */}
            <div className="space-y-2 mb-4">
              {config.botConfig.knowledgeEntries.map((entry, i) => {
                const isExpanded = expandedEntryId === entry.id;
                const typeEmoji: Record<string, string> = { text: '📝', menu: '🍽️', policy: '📋', service: '🛎️', faq: '❓' };
                const typeLabel: Record<string, string> = { text: 'General', menu: 'Menu', policy: 'Policy', service: 'Service', faq: 'FAQ' };
                return (
                  <div key={entry.id} className="border border-bored-gray-200 rounded-xl overflow-hidden transition-all">
                    {/* Collapsed header — always visible */}
                    <div
                      className="flex items-center gap-3 px-5 py-3.5 cursor-pointer hover:bg-bored-gray-50/50 transition-colors"
                      onClick={() => setExpandedEntryId(isExpanded ? null : entry.id)}
                    >
                      {isExpanded ? <ChevronDown size={16} className="text-bored-gray-400 flex-shrink-0" /> : <ChevronRight size={16} className="text-bored-gray-400 flex-shrink-0" />}
                      <span className="text-sm flex-shrink-0">{typeEmoji[entry.type] || '📝'}</span>
                      <span className="text-xs font-medium text-bored-gray-400 uppercase tracking-wide w-14 flex-shrink-0">{typeLabel[entry.type] || 'Info'}</span>
                      <span className="text-sm font-medium text-bored-black truncate flex-1">{entry.title || 'Untitled'}</span>
                      <span className="text-[10px] text-bored-gray-400 flex-shrink-0">{entry.content.length.toLocaleString()} chars</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const updated = config.botConfig.knowledgeEntries.filter((_, j) => j !== i);
                          updateBotConfig('knowledgeEntries', updated);
                          if (isExpanded) setExpandedEntryId(null);
                        }}
                        className="p-1.5 text-bored-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    {/* Expanded editor */}
                    {isExpanded && (
                      <div className="px-5 pb-5 pt-1 border-t border-bored-gray-100 bg-bored-gray-50/30">
                        <div className="flex items-center gap-3 mb-3">
                          <select
                            value={entry.type}
                            onChange={e => updateKnowledgeEntry(i, 'type', e.target.value)}
                            className="px-3 py-2 border border-bored-gray-200 rounded-lg text-xs font-medium bg-white"
                          >
                            <option value="text">📝 General Info</option>
                            <option value="menu">🍽️ Menu / F&B</option>
                            <option value="policy">📋 Policy</option>
                            <option value="service">🛎️ Service</option>
                            <option value="faq">❓ FAQ</option>
                          </select>
                          <input
                            type="text"
                            value={entry.title}
                            onChange={e => updateKnowledgeEntry(i, 'title', e.target.value)}
                            placeholder="Entry title"
                            className="flex-1 px-4 py-2 border border-bored-gray-200 rounded-lg text-sm font-medium bg-white"
                          />
                          <button
                            onClick={() => {
                              const input = document.createElement('input');
                              input.type = 'file';
                              input.accept = '.pdf,.png,.jpg,.jpeg,.webp,.txt,.md';
                              input.onchange = async (ev) => {
                                const file = (ev.target as HTMLInputElement).files?.[0];
                                if (!file) return;
                                setFileProcessing(prev => ({ ...prev, [entry.id]: true }));
                                try {
                                  const result = await extractTextFromFile(file);
                                  updateKnowledgeEntry(i, 'content', result.text);
                                  if (!entry.title) updateKnowledgeEntry(i, 'title', result.fileName.replace(/\.[^.]+$/, ''));
                                } catch (err: any) {
                                  updateKnowledgeEntry(i, 'content', `⚠️ Extraction failed: ${err.message}`);
                                } finally {
                                  setFileProcessing(prev => { const n = { ...prev }; delete n[entry.id]; return n; });
                                }
                              };
                              input.click();
                            }}
                            className="p-2 text-bored-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Replace with file"
                          >
                            <Upload size={15} />
                          </button>
                        </div>
                        {fileProcessing[entry.id] ? (
                          <div className="flex items-center gap-3 py-6 justify-center">
                            <Loader2 size={18} className="animate-spin text-emerald-500" />
                            <span className="text-sm text-emerald-600 font-medium">Reading file...</span>
                          </div>
                        ) : (
                          <textarea
                            value={entry.content}
                            onChange={e => updateKnowledgeEntry(i, 'content', e.target.value)}
                            placeholder="Paste content or upload a file..."
                            className="w-full px-4 py-3 border border-bored-gray-200 rounded-xl text-sm resize-none h-40 font-mono bg-white"
                          />
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Add manually button */}
            <button
              onClick={() => {
                const newId = Date.now().toString();
                const newEntry: KnowledgeEntry = { id: newId, title: '', type: 'text', content: '' };
                updateBotConfig('knowledgeEntries', [...config.botConfig.knowledgeEntries, newEntry]);
                setExpandedEntryId(newId);
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border border-dashed border-bored-gray-300 text-bored-gray-500 hover:border-bored-gray-400 hover:text-bored-gray-700 transition-colors"
            >
              <Plus size={16} /> Add Entry Manually
            </button>

            {config.botConfig.knowledgeEntries.length === 0 && pendingUploads.length === 0 && (
              <div className="mt-4 p-6 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                <BookOpen size={24} className="text-emerald-400 mx-auto mb-2" />
                <p className="text-sm text-emerald-700 font-medium">No knowledge entries yet</p>
                <p className="text-xs text-emerald-600 mt-1">Upload PDFs/images or add entries manually</p>
              </div>
            )}
          </div>

          {/* Preview Prompt */}
          <div className="bg-white rounded-2xl border border-bored-gray-200 p-8">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                <Eye size={16} className="text-gray-600" />
              </div>
              <h2 className="text-lg font-semibold text-bored-black">Prompt Preview</h2>
            </div>
            <p className="text-sm text-bored-gray-500 mb-4 ml-11">Preview of what gets injected into the AI's system prompt from your settings</p>

            <div className="bg-gray-900 text-gray-100 rounded-xl p-6 font-mono text-xs leading-relaxed overflow-auto max-h-64">
              <span className="text-purple-400">// Personality</span><br />
              You are <span className="text-amber-300">{config.botConfig.botName}</span>, a <span className="text-emerald-300">{config.botConfig.personality}</span> concierge at <span className="text-blue-300">{config.name}</span>.<br />
              {config.botConfig.toneDescription && (
                <>Tone: <span className="text-amber-300">{config.botConfig.toneDescription}</span><br /></>
              )}
              <br />
              <span className="text-purple-400">// Language</span><br />
              {config.botConfig.language === 'auto'
                ? <span className="text-gray-400">Respond in the same language the guest uses.</span>
                : <>Always respond in <span className="text-amber-300">{{pt:'Português', en:'English', es:'Español', fr:'Français', de:'Deutsch', it:'Italiano'}[config.botConfig.language]}</span>.<br /></>
              }
              <br />
              <span className="text-purple-400">// Sales: <span className="text-amber-300">{config.botConfig.salesAggressiveness}</span> | Responses: <span className="text-amber-300">{config.botConfig.maxResponseLength}</span></span><br />
              <br />
              {config.botConfig.customInstructions && (
                <>
                  <span className="text-purple-400">// Custom Instructions</span><br />
                  <span className="text-gray-300 whitespace-pre-wrap">{config.botConfig.customInstructions}</span><br /><br />
                </>
              )}
              {config.botConfig.restrictions.length > 0 && (
                <>
                  <span className="text-red-400">// Restrictions</span><br />
                  {config.botConfig.restrictions.filter(r => r.trim()).map((r, i) => (
                    <span key={i}>❌ <span className="text-red-300">{r}</span><br /></span>
                  ))}
                  <br />
                </>
              )}
              {config.botConfig.knowledgeEntries.length > 0 && (
                <>
                  <span className="text-emerald-400">// Knowledge Base ({config.botConfig.knowledgeEntries.length} entries)</span><br />
                  {config.botConfig.knowledgeEntries.map((e, i) => (
                    <span key={i}>📄 <span className="text-emerald-300">{e.title || 'Untitled'}</span> ({e.type}) — {e.content.length} chars<br /></span>
                  ))}
                </>
              )}
            </div>
          </div>

        </div>
      )}

      {/* ── FEATURES SECTION ─────────────────────────────────────────────── */}
      {activeSection === 'features' && (
        <div className="space-y-8">
          <div className="bg-white rounded-2xl border border-bored-gray-200 p-8">
            <h2 className="text-lg font-semibold text-bored-black mb-1">Visible Sections</h2>
            <p className="text-sm text-bored-gray-500 mb-6">Toggle which sections are visible on your public website</p>
            <div className="space-y-1">
              {FEATURE_LABELS.map(({ key, label, description }) => (
                <div key={key} className="flex items-center justify-between py-4 px-4 rounded-xl hover:bg-bored-gray-50 transition-colors">
                  <div>
                    <span className="text-sm font-medium text-bored-black">{label}</span>
                    <p className="text-xs text-bored-gray-500 mt-0.5">{description}</p>
                  </div>
                  <button
                    onClick={() => updateFeature(key)}
                    className={`transition-colors ${config.features[key] ? 'text-emerald-500' : 'text-bored-gray-300'}`}
                  >
                    {config.features[key] ? <ToggleRight size={36} /> : <ToggleLeft size={36} />}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Style */}
          <div className="bg-white rounded-2xl border border-bored-gray-200 p-8">
            <h2 className="text-lg font-semibold text-bored-black mb-1">Activity Style</h2>
            <p className="text-sm text-bored-gray-500 mb-6">Sets the overall vibe for AI recommendations on the chatbot</p>
            <div className="flex gap-3 flex-wrap">
              {(['mixed', 'adventure', 'cultural', 'luxury', 'family'] as const).map(style => (
                <button
                  key={style}
                  onClick={() => setConfig({ ...config, activityPreferences: { ...config.activityPreferences, style } })}
                  className={`px-5 py-2.5 rounded-xl text-sm font-medium capitalize transition-all ${
                    config.activityPreferences.style === style
                      ? 'bg-bored-black text-white shadow-sm'
                      : 'bg-bored-gray-50 border border-bored-gray-200 text-bored-gray-600 hover:bg-bored-gray-100'
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── STAFF SECTION ────────────────────────────────────────────────── */}
      {activeSection === 'staff' && (
        <div className="space-y-8">
          <div className="bg-white rounded-2xl border border-bored-gray-200 p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-bored-black mb-1">Staff Members</h2>
                <p className="text-sm text-bored-gray-500">Staff shown on the public website as concierge picks / recommendations</p>
              </div>
              <button
                onClick={addStaffMember}
                className="flex items-center gap-2 px-4 py-2.5 bg-bored-black text-white rounded-xl text-sm font-medium hover:bg-bored-gray-800 transition-colors"
              >
                <Plus size={16} />
                Add Member
              </button>
            </div>

            {config.staffMembers.length === 0 && (
              <div className="text-center py-12 text-bored-gray-500">
                <Users size={40} className="mx-auto mb-3 text-bored-gray-300" />
                <p className="text-sm">No staff members yet. Add your first team member.</p>
              </div>
            )}

            <div className="space-y-6">
              {config.staffMembers.map((member, index) => (
                <div key={index} className="border border-bored-gray-200 rounded-xl p-6 relative group">
                  <button
                    onClick={() => removeStaffMember(index)}
                    className="absolute top-4 right-4 p-2 text-bored-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                    title="Remove member"
                  >
                    <Trash2 size={16} />
                  </button>
                  <div className="flex gap-6">
                    <div className="flex-shrink-0">
                      {member.avatar ? (
                        <img src={member.avatar} alt={member.name} className="w-16 h-16 rounded-full object-cover" />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-bored-gray-100 flex items-center justify-center text-bored-gray-400">
                          <Users size={24} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <InputField label="Name" value={member.name} onChange={v => updateStaffMember(index, 'name', v)} />
                        <InputField label="Role" value={member.role} placeholder="e.g. Concierge" onChange={v => updateStaffMember(index, 'role', v)} />
                      </div>
                      <InputField label="Avatar URL" value={member.avatar} placeholder="https://..." onChange={v => updateStaffMember(index, 'avatar', v)} />
                      <div>
                        <label className="block text-xs font-semibold text-bored-gray-500 mb-2 uppercase tracking-wide">Bio</label>
                        <textarea
                          value={member.bio}
                          onChange={e => updateStaffMember(index, 'bio', e.target.value)}
                          rows={2}
                          className="w-full px-4 py-3 border border-bored-gray-200 rounded-xl text-sm resize-none"
                          placeholder="A short description..."
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-bored-gray-500 mb-2 uppercase tracking-wide">Preferred Categories</label>
                        <div className="flex flex-wrap gap-2">
                          {CATEGORIES.map(cat => {
                            const isActive = member.preferredCategories.includes(cat);
                            return (
                              <button
                                key={cat}
                                onClick={() => {
                                  const updated = isActive
                                    ? member.preferredCategories.filter(c => c !== cat)
                                    : [...member.preferredCategories, cat];
                                  updateStaffMember(index, 'preferredCategories', updated);
                                }}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                  isActive
                                    ? 'bg-bored-neon text-bored-black'
                                    : 'bg-bored-gray-50 text-bored-gray-500 hover:bg-bored-gray-100'
                                }`}
                              >
                                {cat}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── ACCOUNT SECTION ──────────────────────────────────────────────── */}
      {activeSection === 'account' && (
        <div className="space-y-8">
          <div className="bg-white rounded-2xl border border-bored-gray-200 p-8 max-w-lg">
            <h2 className="text-lg font-semibold text-bored-black mb-1">Change Password</h2>
            <p className="text-sm text-bored-gray-500 mb-6">Update the password for your account</p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-bored-gray-500 mb-2 uppercase tracking-wide">New Password</label>
                <input
                  type="password"
                  value={pwNew}
                  onChange={e => { setPwNew(e.target.value); setPwStatus('idle'); }}
                  placeholder="Minimum 8 characters"
                  className="w-full px-4 py-3 border border-bored-gray-200 rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-bored-gray-500 mb-2 uppercase tracking-wide">Confirm New Password</label>
                <input
                  type="password"
                  value={pwConfirm}
                  onChange={e => { setPwConfirm(e.target.value); setPwStatus('idle'); }}
                  placeholder="Repeat new password"
                  className="w-full px-4 py-3 border border-bored-gray-200 rounded-xl text-sm"
                />
              </div>
            </div>

            {pwStatus === 'error' && (
              <div className="mt-4 flex items-center gap-2 text-red-600 text-sm">
                <AlertCircle size={15} />
                {pwError}
              </div>
            )}
            {pwStatus === 'success' && (
              <div className="mt-4 flex items-center gap-2 text-green-600 text-sm">
                <Check size={15} />
                Password updated successfully!
              </div>
            )}

            <button
              onClick={async () => {
                setPwError('');
                if (!pwNew || pwNew.length < 8) {
                  setPwError('Password must be at least 8 characters.');
                  setPwStatus('error');
                  return;
                }
                if (pwNew !== pwConfirm) {
                  setPwError('Passwords do not match.');
                  setPwStatus('error');
                  return;
                }
                setPwSaving(true);
                // Ensure session is fresh before updating
                if (!authSession) {
                  const { error: refreshError } = await supabase.auth.refreshSession();
                  if (refreshError) {
                    setPwError('Session expired. Please log out and log in again.');
                    setPwStatus('error');
                    setPwSaving(false);
                    return;
                  }
                }
                const { error } = await supabase.auth.updateUser({ password: pwNew });
                setPwSaving(false);
                if (error) {
                  setPwError(error.message);
                  setPwStatus('error');
                } else {
                  setPwStatus('success');
                  setPwNew('');
                  setPwConfirm('');
                }
              }}
              disabled={pwSaving}
              className="mt-6 flex items-center gap-2 px-6 py-3 bg-bored-black text-white rounded-xl text-sm font-medium hover:bg-bored-gray-800 transition-colors disabled:opacity-50"
            >
              {pwSaving ? <Loader2 size={15} className="animate-spin" /> : <Lock size={15} />}
              {pwSaving ? 'Saving…' : 'Update Password'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

const ColorPicker = ({ label, sublabel, value, onChange }: { label: string; sublabel?: string; value: string; onChange: (v: string) => void }) => (
  <div>
    <label className="block text-xs font-semibold text-bored-gray-500 mb-1 uppercase tracking-wide">{label}</label>
    {sublabel && <span className="block text-[10px] text-bored-gray-400 mb-2">{sublabel}</span>}
    <div className="flex items-center gap-3">
      <input type="color" value={value} onChange={e => onChange(e.target.value)} className="w-12 h-12 rounded-xl border border-bored-gray-200 cursor-pointer p-1" />
      <input type="text" value={value} onChange={e => onChange(e.target.value)} className="flex-1 px-4 py-3 border border-bored-gray-200 rounded-xl text-sm font-mono" />
    </div>
  </div>
);

const InputField = ({ label, value, onChange, placeholder, type = 'text', icon }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; icon?: React.ReactNode;
}) => (
  <div>
    <label className="block text-xs font-semibold text-bored-gray-500 mb-2 uppercase tracking-wide">{label}</label>
    <div className="relative">
      {icon && <span className="absolute left-4 top-1/2 -translate-y-1/2 text-bored-gray-400">{icon}</span>}
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className={`w-full px-4 py-3 border border-bored-gray-200 rounded-xl text-sm ${icon ? 'pl-10' : ''}`} />
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const FEATURE_LABELS: { key: keyof SiteFeatures; label: string; description: string }[] = [
  { key: 'showActivities', label: 'Activities', description: 'Show outdoor & adventure activities on the website' },
  { key: 'showSpa', label: 'Spa & Wellness', description: 'Show spa and wellness experiences' },
  { key: 'showRentals', label: 'Rentals', description: 'Show rental equipment and vehicles' },
  { key: 'showReviews', label: 'Reviews', description: 'Show guest reviews on experience pages' },
  { key: 'showHotelPicks', label: 'Hotel Picks', description: 'Show staff-curated experience recommendations' },
  { key: 'showPreArrival', label: 'Pre-Arrival', description: 'Enable the pre-arrival itinerary builder' },
  { key: 'enableInstantBooking', label: 'Instant Booking', description: 'Allow guests to book without approval' },
];

const CATEGORIES = [
  'Outdoors', 'Sports', 'Culture Dive', 'Local Cooking',
  'Time Stories', 'Micro Adventures', 'Night Explorer', 'Mind & Body',
];
