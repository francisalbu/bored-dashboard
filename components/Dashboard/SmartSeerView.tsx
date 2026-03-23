// ─────────────────────────────────────────────────────────────────────────────
// SmartSeerView — Simulador de teste do SmartSeer para o dashboard
// Permite testar a personalização sem precisar do site dos guests
// Só visível quando o hotel ativo tem SmartSeer ativo (lisbon-hostel em beta)
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useCallback } from 'react';
import {
  Sparkles, RefreshCw, Clock, Globe, Smartphone,
  ChevronRight, MapPin, Star, Euro, X, Eye
} from 'lucide-react';
import { fetchHotelExperiencesOrdered } from '../../lib/experienceService';
import type { ExperienceRow }           from '../../lib/experienceService';
import {
  emptyPersonaScore, normalizeScores,
  getTopPersona, PERSONAS, PersonaScore, PersonaKey,
  parseDurationHours,
} from '../../lib/smartseer/personas';
import { scoreEvent, applySessionBoosters, ScoringEvent } from '../../lib/smartseer/scoring-engine';
import { rankExperiences, SessionContext }                 from '../../lib/smartseer/context-filter';
import { getSmartMessage }                                 from '../../lib/smartseer/smart-messages';
import { SmartBanner }                                     from '../SmartSeer/SmartBanner';
import { useCardTracker }                                  from '../../lib/smartseer/use-negative-signals';

// ─── Props ────────────────────────────────────────────────────────────────────
interface SmartSeerViewProps {
  hotelId: string;
}

// ─── Configurações de simulação ───────────────────────────────────────────────
const COUNTRY_OPTIONS = [
  { code: 'SE', label: '🇸🇪 Suécia'       },
  { code: 'DE', label: '🇩🇪 Alemanha'     },
  { code: 'GB', label: '🇬🇧 Reino Unido'  },
  { code: 'US', label: '🇺🇸 Estados Unidos'},
  { code: 'JP', label: '🇯🇵 Japão'        },
  { code: 'FR', label: '🇫🇷 França'       },
  { code: 'ES', label: '🇪🇸 Espanha'      },
  { code: 'PT', label: '🇵🇹 Portugal'     },
  { code: 'BR', label: '🇧🇷 Brasil'       },
  { code: 'AU', label: '🇦🇺 Austrália'    },
];

const DEVICE_OPTIONS: { value: 'premium' | 'mid' | 'budget'; label: string }[] = [
  { value: 'premium', label: '📱 iPhone 15 Pro' },
  { value: 'mid',     label: '📱 Android recente' },
  { value: 'budget',  label: '📱 Android antigo' },
];

// ─── Card de Experiência com tracking ─────────────────────────────────────────
const TrackableCard: React.FC<{
  exp:        ExperienceRow;
  rank:       number;
  trackEvent: (e: Omit<ScoringEvent, 'timestamp'>) => void;
}> = ({ exp, rank, trackEvent }) => {
  const { onEnter, onLeave, onDismiss } = useCardTracker(exp, trackEvent);
  const hours = parseDurationHours(exp.duration);

  const handleClick = () => {
    trackEvent({
      type:         'click',
      experienceId: String(exp.id),
      tags:         exp.tags ?? [],
      category:     exp.category,
      price:        exp.price,
      durationH:    hours,
    });
  };

  return (
    <div
      className="relative bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-gray-300 transition-all cursor-pointer group"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onClick={handleClick}
    >
      {/* Rank badge */}
      <div className="absolute top-3 left-3 z-10 w-6 h-6 bg-black/70 text-white rounded-full flex items-center justify-center text-xs font-bold">
        {rank}
      </div>

      {/* Dismiss button */}
      <button
        onClick={e => { e.stopPropagation(); onDismiss(); }}
        className="absolute top-3 right-3 z-10 w-6 h-6 bg-black/50 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        title="Não me interessa"
      >
        <X size={12} />
      </button>

      {/* Image */}
      {exp.image_url && (
        <div className="h-40 overflow-hidden bg-gray-100">
          <img
            src={exp.image_url}
            alt={exp.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        <div className="flex flex-wrap gap-1 mb-2">
          <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full text-gray-600">{exp.category}</span>
          {(exp.tags ?? []).slice(0, 2).map(t => (
            <span key={t} className="text-xs px-2 py-0.5 bg-blue-50 rounded-full text-blue-600">{t}</span>
          ))}
        </div>

        <h3 className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2 leading-snug">
          {exp.title}
        </h3>

        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1">
              <Clock size={11} /> {exp.duration}
            </span>
            {exp.rating > 0 && (
              <span className="flex items-center gap-1">
                <Star size={11} className="text-yellow-400 fill-yellow-400" /> {exp.rating.toFixed(1)}
              </span>
            )}
          </div>
          <span className="font-semibold text-gray-900">
            {exp.price === 0 ? 'Grátis' : `€${exp.price}`}
          </span>
        </div>
      </div>
    </div>
  );
};

// ─── View Principal ────────────────────────────────────────────────────────────
export const SmartSeerView: React.FC<SmartSeerViewProps> = ({ hotelId }) => {
  // ── Simulação ───────────────────────────────────────────────────────────────
  const [context,  setContext]  = useState<SessionContext>('in_stay');
  const [hour,     setHour]     = useState(new Date().getHours());
  const [country,  setCountry]  = useState('DE');
  const [device,   setDevice]   = useState<'premium' | 'mid' | 'budget'>('mid');

  // ── Dados ───────────────────────────────────────────────────────────────────
  const [allExps,  setAllExps]  = useState<ExperienceRow[]>([]);
  const [loading,  setLoading]  = useState(true);

  // ── Scores e ranking ────────────────────────────────────────────────────────
  const [scores,   setScores]   = useState<PersonaScore>(emptyPersonaScore());
  const [ranked,   setRanked]   = useState<ExperienceRow[]>([]);

  // ── Carregar experiências ────────────────────────────────────────────────────
  useEffect(() => {
    setLoading(true);
    fetchHotelExperiencesOrdered(hotelId).then(exps => {
      setAllExps(exps);
      setLoading(false);
    });
  }, [hotelId]);

  // ── Aplicar boosters quando os controlos mudam ───────────────────────────────
  const resetAndApplyBoosters = useCallback(() => {
    const now = new Date();
    const boosters = applySessionBoosters({
      accessHour:      hour,
      isWeekday:       now.getDay() >= 1 && now.getDay() <= 5,
      originCountry:   country,
      spendingProfile: device,
    });
    const normalized = normalizeScores(boosters);
    setScores(normalized);
  }, [hour, country, device]);

  useEffect(() => {
    resetAndApplyBoosters();
  }, [resetAndApplyBoosters]);

  // ── Re-rank quando scores ou contexto mudam ──────────────────────────────────
  useEffect(() => {
    if (allExps.length === 0) return;
    const reranked = rankExperiences(allExps, {
      context,
      currentHour:     hour,
      personaScores:   scores,
      spendingProfile: device,
    });
    setRanked(reranked);
  }, [scores, context, hour, device, allExps]);

  // ── Tracking de eventos (atualiza scores em tempo real) ──────────────────────
  const trackEvent = useCallback((event: Omit<ScoringEvent, 'timestamp'>) => {
    setScores(prev => {
      const updated    = scoreEvent(prev, { ...event, timestamp: Date.now() });
      const normalized = normalizeScores(updated);
      return normalized;
    });
  }, []);

  // ── Computed ─────────────────────────────────────────────────────────────────
  const topPersona    = getTopPersona(scores);
  const topMeta       = PERSONAS[topPersona];
  const smartMessage  = getSmartMessage(topPersona, context, hour);
  const sortedScores  = (Object.entries(scores) as [PersonaKey, number][]).sort((a, b) => b[1] - a[1]);

  return (
    <div className="max-w-7xl mx-auto px-8 pb-16">

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles size={18} className="text-yellow-500" />
          <h1 className="text-2xl font-light tracking-tight text-gray-900">
            SmartSeer <span className="text-xs font-medium text-yellow-600 bg-yellow-100 px-2 py-0.5 rounded-full ml-1">Beta</span>
          </h1>
        </div>
        <p className="text-sm text-gray-500">
          Simula como um guest vê as experiências — em tempo real, sem login.
        </p>
      </div>

      {/* Controlos de simulação */}
      <div className="bg-gray-50 rounded-2xl border border-gray-200 p-5 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Eye size={14} className="text-gray-400" />
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Simular perfil do guest</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

          {/* Contexto */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Contexto</label>
            <div className="flex gap-1">
              <button
                onClick={() => setContext('pre_arrival')}
                className={`flex-1 text-xs px-2 py-2 rounded-lg border transition-all ${
                  context === 'pre_arrival'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                }`}
              >
                ✈️ Pre-Arrival
              </button>
              <button
                onClick={() => setContext('in_stay')}
                className={`flex-1 text-xs px-2 py-2 rounded-lg border transition-all ${
                  context === 'in_stay'
                    ? 'bg-green-600 text-white border-green-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                }`}
              >
                🏨 In-Stay
              </button>
            </div>
          </div>

          {/* Hora */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              <Clock size={11} className="inline mr-1" />
              Hora — {hour}:00
              {hour >= 17 && hour < 20 && <span className="ml-1 text-amber-500">🌅 Golden Hour</span>}
              {hour >= 20 && <span className="ml-1 text-indigo-500">🌙 Noite</span>}
            </label>
            <input
              type="range" min="0" max="23" value={hour}
              onChange={e => setHour(Number(e.target.value))}
              className="w-full accent-gray-900"
            />
          </div>

          {/* País */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              <Globe size={11} className="inline mr-1" />
              País de origem
            </label>
            <select
              value={country}
              onChange={e => setCountry(e.target.value)}
              className="w-full text-xs border border-gray-200 rounded-lg px-2 py-2 bg-white text-gray-700"
            >
              {COUNTRY_OPTIONS.map(c => (
                <option key={c.code} value={c.code}>{c.label}</option>
              ))}
            </select>
          </div>

          {/* Device */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              <Smartphone size={11} className="inline mr-1" />
              Device
            </label>
            <select
              value={device}
              onChange={e => setDevice(e.target.value as 'premium' | 'mid' | 'budget')}
              className="w-full text-xs border border-gray-200 rounded-lg px-2 py-2 bg-white text-gray-700"
            >
              {DEVICE_OPTIONS.map(d => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Reset */}
        <button
          onClick={() => { setScores(emptyPersonaScore()); resetAndApplyBoosters(); }}
          className="mt-3 flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700 transition-colors"
        >
          <RefreshCw size={11} /> Reset scores
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

        {/* Coluna esquerda — Persona Scores */}
        <div className="lg:col-span-1 space-y-4">

          {/* Smart Banner */}
          <SmartBanner
            message={smartMessage}
            persona={topPersona}
            context={context}
            loading={loading}
          />

          {/* Persona scores */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
              Persona Scores
            </p>
            <div className="space-y-3">
              {sortedScores.map(([key, score]) => {
                const meta  = PERSONAS[key];
                const isTop = key === topPersona;
                return (
                  <div key={key}>
                    <div className="flex justify-between items-center mb-1">
                      <span className={`text-xs ${isTop ? 'font-bold text-gray-900' : 'text-gray-500'}`}>
                        {meta.emoji} {meta.label}
                      </span>
                      <span className={`text-xs font-mono ${isTop ? 'text-yellow-600 font-bold' : 'text-gray-400'}`}>
                        {score}
                      </span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${isTop ? 'bg-yellow-400' : 'bg-gray-300'}`}
                        style={{ width: `${score}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Persona dominante */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Persona dominante</p>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{topMeta.emoji}</span>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{topMeta.label}</p>
                  <p className="text-xs text-gray-400">{topMeta.description}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Instruções */}
          <div className="bg-blue-50 rounded-xl border border-blue-100 p-4 text-xs text-blue-700 space-y-1.5">
            <p className="font-semibold">Como testar:</p>
            <p>👆 Clica num card → score sobe</p>
            <p>✕ Fecha um card → score desce</p>
            <p>🖱️ Passa rápido → fast_scroll (−)</p>
            <p>⏸️ Para 1.5s → scroll_pause (+)</p>
          </div>
        </div>

        {/* Coluna direita — Experiências ranqueadas */}
        <div className="lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">
                {ranked.length} experiências ranqueadas
              </h2>
              <p className="text-xs text-gray-400">
                {context === 'pre_arrival'
                  ? 'Pre-Arrival: duração longa + logística em destaque'
                  : `In-Stay: ${23 - hour}h disponíveis hoje`}
              </p>
            </div>
            <div className="text-xs text-gray-400">
              Ordenado por relevância para {topMeta.emoji} {topMeta.label}
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-64 bg-gray-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : ranked.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-gray-400 text-sm">
                Nenhuma experiência disponível para este contexto.
              </p>
              <p className="text-gray-300 text-xs mt-1">
                {context === 'in_stay' && hour >= 22
                  ? 'São 22h+ — só nightlife disponível.'
                  : 'Tenta mudar o contexto ou a hora.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {ranked.map((exp, i) => (
                <TrackableCard
                  key={exp.id}
                  exp={exp}
                  rank={i + 1}
                  trackEvent={trackEvent}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
