// ─────────────────────────────────────────────────────────────────────────────
// SmartBanner — Banner contextual exibido no topo da página de experiências
// Muda em tempo real conforme a persona dominante do guest
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { SmartMessage }    from '../../lib/smartseer/smart-messages';
import { PersonaKey }      from '../../lib/smartseer/personas';
import { SessionContext }  from '../../lib/smartseer/context-filter';

type SmartBannerProps = {
  message:     SmartMessage;
  persona:     PersonaKey;
  context:     SessionContext;
  loading?:    boolean;
  onCtaClick?: () => void;
};

// Cor de fundo por persona
const PERSONA_BG: Record<PersonaKey, string> = {
  social_butterfly:  'bg-pink-50  border-pink-200',
  digital_nomad:     'bg-teal-50  border-teal-200',
  adrenaline_junkie: 'bg-orange-50 border-orange-200',
  culture_buff:      'bg-violet-50 border-violet-200',
  chill_foodie:      'bg-amber-50  border-amber-200',
  budget_explorer:   'bg-emerald-50 border-emerald-200',
  nature_lover:      'bg-green-50  border-green-200',
};

const PERSONA_CTA_BTN: Record<PersonaKey, string> = {
  social_butterfly:  'bg-pink-500   hover:bg-pink-600',
  digital_nomad:     'bg-teal-500   hover:bg-teal-600',
  adrenaline_junkie: 'bg-orange-500 hover:bg-orange-600',
  culture_buff:      'bg-violet-500 hover:bg-violet-600',
  chill_foodie:      'bg-amber-500  hover:bg-amber-600',
  budget_explorer:   'bg-emerald-500 hover:bg-emerald-600',
  nature_lover:      'bg-green-500  hover:bg-green-600',
};

// Badge de contexto
const CONTEXT_BADGE: Record<SessionContext, { label: string; style: string }> = {
  pre_arrival: {
    label: 'A planear a viagem',
    style: 'bg-blue-100 text-blue-700',
  },
  in_stay: {
    label: 'Agora em Lisboa',
    style: 'bg-green-100 text-green-700',
  },
};

export const SmartBanner: React.FC<SmartBannerProps> = ({
  message,
  persona,
  context,
  loading = false,
  onCtaClick,
}) => {
  if (loading) {
    // Skeleton
    return (
      <div className="w-full rounded-2xl border bg-gray-50 border-gray-200 p-5 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
        <div className="h-3 bg-gray-100 rounded w-2/3" />
      </div>
    );
  }

  const bg     = PERSONA_BG[persona]     ?? 'bg-gray-50 border-gray-200';
  const btn    = PERSONA_CTA_BTN[persona] ?? 'bg-gray-700 hover:bg-gray-800';
  const badge  = CONTEXT_BADGE[context];

  return (
    <div className={`w-full rounded-2xl border ${bg} p-5 transition-all duration-500`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Context badge */}
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mb-2 ${badge.style}`}>
            {badge.label}
          </span>

          {/* Headline */}
          <h3 className="text-base font-semibold text-gray-900 leading-snug mb-1">
            {message.headline}
          </h3>

          {/* Subtext */}
          <p className="text-sm text-gray-600 leading-relaxed">
            {message.subtext}
          </p>
        </div>

        {/* CTA Button */}
        {onCtaClick && (
          <button
            onClick={onCtaClick}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-white text-sm font-medium transition-colors ${btn}`}
          >
            {message.cta}
          </button>
        )}
      </div>
    </div>
  );
};
