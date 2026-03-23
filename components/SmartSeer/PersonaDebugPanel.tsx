// ─────────────────────────────────────────────────────────────────────────────
// PersonaDebugPanel — Painel de debug para testar o SmartSeer
// Só visível quando URL contém ?debug=smartseer
// Mostra: persona scores, contexto, spending profile, país
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { PersonaScore, PERSONAS, PersonaKey } from '../../lib/smartseer/personas';
import { AnonymousSession }                   from '../../lib/session/session-manager';
import { SessionContext }                     from '../../lib/smartseer/context-filter';

type PersonaDebugPanelProps = {
  session:       AnonymousSession | null;
  personaScores: PersonaScore;
  topPersona:    string;
  context:       SessionContext;
  loading:       boolean;
};

export const PersonaDebugPanel: React.FC<PersonaDebugPanelProps> = ({
  session,
  personaScores,
  topPersona,
  context,
  loading,
}) => {
  const [minimized, setMinimized] = useState(false);

  // Só mostra em modo debug
  const isDebug = new URLSearchParams(window.location.search).get('debug') === 'smartseer';
  if (!isDebug) return null;

  const sorted = (Object.entries(personaScores) as [PersonaKey, number][])
    .sort((a, b) => b[1] - a[1]);

  return (
    <div className="fixed bottom-4 right-4 z-50 w-72 bg-gray-900 text-white rounded-2xl shadow-2xl text-xs font-mono overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 bg-gray-800 cursor-pointer"
        onClick={() => setMinimized(m => !m)}
      >
        <div className="flex items-center gap-2">
          <span className="text-green-400">●</span>
          <span className="font-semibold text-white">SmartSeer Debug</span>
        </div>
        <span className="text-gray-400">{minimized ? '▲' : '▼'}</span>
      </div>

      {!minimized && (
        <div className="p-4 space-y-4">
          {loading && (
            <p className="text-gray-400 animate-pulse">Inicializando sessão…</p>
          )}

          {/* Sessão */}
          {session && (
            <div className="space-y-1">
              <p className="text-gray-400 uppercase tracking-wider text-[10px]">Sessão</p>
              <p><span className="text-gray-400">Contexto: </span>
                <span className={context === 'pre_arrival' ? 'text-blue-400' : 'text-green-400'}>
                  {context === 'pre_arrival' ? '✈️ Pre-Arrival' : '🏨 In-Stay'}
                </span>
              </p>
              <p><span className="text-gray-400">Hora entrada: </span>{session.entryHour}h</p>
              <p><span className="text-gray-400">País: </span>{session.ipCountry ?? '?'}</p>
              <p><span className="text-gray-400">Device: </span>{session.spendingProfile}</p>
              <p className="text-gray-500 break-all">
                {session.sessionToken.slice(0, 16)}…
              </p>
            </div>
          )}

          {/* Persona Scores */}
          <div className="space-y-2">
            <p className="text-gray-400 uppercase tracking-wider text-[10px]">Persona Scores</p>
            {sorted.map(([key, score]) => {
              const meta    = PERSONAS[key];
              const isTop   = key === topPersona;
              const barW    = `${score}%`;
              return (
                <div key={key}>
                  <div className="flex items-center justify-between mb-0.5">
                    <span className={isTop ? 'text-white font-bold' : 'text-gray-300'}>
                      {meta?.emoji} {meta?.label ?? key}
                    </span>
                    <span className={isTop ? 'text-yellow-400 font-bold' : 'text-gray-400'}>
                      {score}
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${isTop ? 'bg-yellow-400' : 'bg-gray-500'}`}
                      style={{ width: barW }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Top persona */}
          <div className="border-t border-gray-700 pt-3">
            <p className="text-gray-400 text-[10px] uppercase tracking-wider mb-1">Persona Dominante</p>
            <p className="text-yellow-400 font-bold text-sm">
              {PERSONAS[topPersona as PersonaKey]?.emoji}{' '}
              {PERSONAS[topPersona as PersonaKey]?.label ?? topPersona}
            </p>
            <p className="text-gray-400 text-[10px] mt-0.5">
              {PERSONAS[topPersona as PersonaKey]?.description}
            </p>
          </div>

          {/* URL para testar */}
          <div className="border-t border-gray-700 pt-3 space-y-1">
            <p className="text-gray-400 text-[10px] uppercase tracking-wider">URLs de Teste</p>
            <p className="text-blue-400">?ctx=pre&hotel=lisbon-hostel</p>
            <p className="text-green-400">?ctx=stay&hotel=lisbon-hostel</p>
          </div>
        </div>
      )}
    </div>
  );
};
