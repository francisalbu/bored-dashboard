// ─────────────────────────────────────────────────────────────────────────────
// SmartSeer — Smart Messages
// Mensagem contextual por persona + contexto (pre_arrival / in_stay) + hora
// ─────────────────────────────────────────────────────────────────────────────

import { PersonaKey } from './personas';
import { SessionContext } from './context-filter';

export type SmartMessage = {
  headline: string;
  subtext:  string;
  cta:      string;   // call-to-action button label
};

// ─── Pre-Arrival: planear antes de chegar ─────────────────────────────────────
const PRE_ARRIVAL: Record<PersonaKey, SmartMessage> = {
  social_butterfly: {
    headline: '🎉 A festa começa antes de chegares',
    subtext:  'Pub crawls e eventos em grupo esgotam rápido. Garante o teu lugar.',
    cta:      'Ver eventos sociais',
  },
  digital_nomad: {
    headline: '💻 Trabalha de dia, explora de tarde',
    subtext:  'Planeia o teu after-work perfeito. O sunset boat não espera.',
    cta:      'Ver experiências de tarde',
  },
  adrenaline_junkie: {
    headline: '🏄 O dia de aventura começa com antecedência',
    subtext:  'Surf, coasteering e aventuras ao ar livre — grupos são limitados.',
    cta:      'Ver aventuras disponíveis',
  },
  culture_buff: {
    headline: '🏛️ Não percas os essenciais de Lisboa',
    subtext:  'Tours guiados com os melhores guias enchem semanas antes.',
    cta:      'Explorar tours culturais',
  },
  chill_foodie: {
    headline: '🍷 As melhores mesas enchem semanas antes',
    subtext:  'Wine tastings, cooking classes e jantares especiais — reserva já.',
    cta:      'Ver experiências gastronómicas',
  },
  budget_explorer: {
    headline: '🎒 Lisboa grátis (ou quase)',
    subtext:  'As melhores experiências não precisam de custar muito. Descobre.',
    cta:      'Ver free tours e budget picks',
  },
  nature_lover: {
    headline: '🌿 A natureza não espera',
    subtext:  'Dolphin watching e tours de natureza esgotam rápido. Reserva já.',
    cta:      'Ver experiências de natureza',
  },
};

// ─── In-Stay: o guest já está no hostel ──────────────────────────────────────
const IN_STAY_DEFAULT: Record<PersonaKey, SmartMessage> = {
  social_butterfly: {
    headline: '🎉 Faz novos amigos hoje',
    subtext:  'Há eventos de grupo a começar em breve — junta-te!',
    cta:      'Ver o que há para hoje',
  },
  digital_nomad: {
    headline: '💻 Tarde livre?',
    subtext:  'Termina o dia com algo especial fora do ecrã.',
    cta:      'Explorar para hoje à tarde',
  },
  adrenaline_junkie: {
    headline: '🏄 Pronto para a ação?',
    subtext:  'Ainda há vagas para hoje. Não deixes para amanhã.',
    cta:      'Ver aventuras para hoje',
  },
  culture_buff: {
    headline: '🏛️ A cidade está à tua espera',
    subtext:  'Descobre os segredos que os guias locais só partilham pessoalmente.',
    cta:      'Explorar tours de hoje',
  },
  chill_foodie: {
    headline: '🍷 Mereces uma pausa bem passada',
    subtext:  'Sunset, vinho, boa companhia. O que mais precisas?',
    cta:      'Ver experiências relaxantes',
  },
  budget_explorer: {
    headline: '🎒 Muito para ver, pouco para gastar',
    subtext:  'Explora Lisboa sem partir a carteira. Temos o que precisas.',
    cta:      'Ver free tours de hoje',
  },
  nature_lover: {
    headline: '🌿 A natureza está mesmo ali',
    subtext:  'Saídas de dolphin watching e natureza ainda têm vagas hoje.',
    cta:      'Ver tours de natureza',
  },
};

// ─── In-Stay Overrides por hora do dia ───────────────────────────────────────
// Sobrepõem-se à persona quando a hora é determinante
function getHourOverride(hour: number): SmartMessage | null {
  // Golden hour (17h–19h30)
  if (hour >= 17 && hour < 20) {
    return {
      headline: '🌅 Golden Hour',
      subtext:  'Ainda vais a tempo do sunset. O barco sai em breve.',
      cta:      'Ver saídas de sunset',
    };
  }
  // Noite (20h+)
  if (hour >= 20) {
    return {
      headline: '🌙 A noite está a começar',
      subtext:  'Descobre o que está a acontecer agora mesmo em Lisboa.',
      cta:      'Ver a noite de Lisboa',
    };
  }
  // Manhã cedo (antes das 9h)
  if (hour < 9) {
    return {
      headline: '🌅 Bom dia, aventureiro!',
      subtext:  'Os melhores free tours começam de manhã cedo.',
      cta:      'Ver tours de manhã',
    };
  }
  return null; // sem override → usa persona
}

// ─── Função principal ─────────────────────────────────────────────────────────
export function getSmartMessage(
  persona:  PersonaKey,
  context:  SessionContext,
  hour:     number,
): SmartMessage {
  if (context === 'pre_arrival') {
    return PRE_ARRIVAL[persona];
  }

  // In-Stay: verificar override por hora primeiro
  const hourOverride = getHourOverride(hour);
  if (hourOverride) return hourOverride;

  return IN_STAY_DEFAULT[persona];
}
