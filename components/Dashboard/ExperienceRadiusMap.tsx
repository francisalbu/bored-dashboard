/**
 * ExperienceRadiusMap
 * -------------------
 * An interactive Leaflet map showing:
 *  - Hotel pin at the centre
 *  - A circle representing the selected radius
 *  - Each experience as a coloured dot (green = active, grey = outside radius)
 */

import React, { useEffect, useRef, useState } from 'react';
import type { ExperienceRow } from '../../lib/experienceService';

// Leaflet CSS must be in index.html or imported here
import 'leaflet/dist/leaflet.css';

interface Props {
  hotelLat: number;
  hotelLng: number;
  hotelName: string;
  radiusKm: number;
  experiences: ExperienceRow[];
  cityFilter: string | null;
}

// Simple haversine for distance
function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export const ExperienceRadiusMap: React.FC<Props> = ({
  hotelLat,
  hotelLng,
  hotelName,
  radiusKm,
  experiences,
  cityFilter,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const leafletMapRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const circleRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markersRef = useRef<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const hotelMarkerRef = useRef<any>(null);
  const [mapReady, setMapReady] = useState(false);

  // Initialise map once
  useEffect(() => {
    if (!mapRef.current || leafletMapRef.current) return;

    // Dynamic import to avoid SSR issues
    import('leaflet').then(L => {
      // Fix default icon paths (Vite/webpack issue)
      // @ts-expect-error leaflet icon fix
      delete L.default.Icon.Default.prototype._getIconUrl;
      L.default.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const map = L.default.map(mapRef.current!, {
        center: [hotelLat, hotelLng],
        zoom: 11,
        zoomControl: true,
        scrollWheelZoom: true,
      });

      // CartoDB Positron — clean light tile (no API key needed)
      L.default.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '© <a href="https://carto.com">CARTO</a> © <a href="https://www.openstreetmap.org/copyright">OSM</a>',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map);

      // Hotel pin
      const hotelIcon = L.default.divIcon({
        className: '',
        html: `<div style="
          width: 18px; height: 18px;
          background: #18181b;
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 10px rgba(0,0,0,0.35);
        "></div>`,
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      });

      hotelMarkerRef.current = L.default
        .marker([hotelLat, hotelLng], { icon: hotelIcon, zIndexOffset: 1000 })
        .addTo(map)
        .bindPopup(`<strong>${hotelName}</strong><br/><span style="font-size:11px">Hotel</span>`);

      // Radius circle — solid black border, clearly visible
      circleRef.current = L.default
        .circle([hotelLat, hotelLng], {
          radius: radiusKm * 1000,
          color: '#18181b',
          fillColor: '#18181b',
          fillOpacity: 0.06,
          weight: 2.5,
        })
        .addTo(map);

      leafletMapRef.current = map;
      setMapReady(true);
    });

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update circle when radius changes
  useEffect(() => {
    if (!circleRef.current) return;
    circleRef.current.setRadius(radiusKm * 1000);
    // Fit map to circle bounds
    if (leafletMapRef.current) {
      leafletMapRef.current.fitBounds(circleRef.current.getBounds(), { padding: [40, 40] });
    }
  }, [radiusKm]);

  // Re-render experience dots whenever experiences / radius changes
  useEffect(() => {
    if (!leafletMapRef.current) return;

    import('leaflet').then(L => {
      // Remove old markers
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];

      const expsWithCoords = experiences.filter(e => e.latitude && e.longitude);

      expsWithCoords.forEach(exp => {
        const dist = haversineKm(hotelLat, hotelLng, exp.latitude!, exp.longitude!);
        const withinCircle = dist <= radiusKm;
        const isActive = exp.is_active;

        const color = isActive && withinCircle
          ? '#16a34a'   // green
          : isActive && !withinCircle
          ? '#ea580c'   // orange
          : '#94a3b8';  // slate

        const glow = isActive && withinCircle
          ? 'box-shadow: 0 0 0 3px rgba(22,163,74,0.15), 0 1px 6px rgba(22,163,74,0.3);'
          : isActive && !withinCircle
          ? 'box-shadow: 0 0 0 3px rgba(234,88,12,0.12);'
          : 'box-shadow: 0 1px 3px rgba(0,0,0,0.15);';

        const icon = L.default.divIcon({
          className: '',
          html: `<div title="${exp.title}" style="
            width: 11px; height: 11px;
            background: ${color};
            border: 2px solid white;
            border-radius: 50%;
            ${glow}
            cursor: pointer;
          "></div>`,
          iconSize: [11, 11],
          iconAnchor: [5.5, 5.5],
        });

        const marker = L.default
          .marker([exp.latitude!, exp.longitude!], { icon })
          .addTo(leafletMapRef.current)
          .bindPopup(`
            <div style="font-family: system-ui, sans-serif; min-width: 160px">
              <div style="font-size:13px;font-weight:600;color:#111;margin-bottom:4px">${exp.title}</div>
              <div style="font-size:11px;color:#6b7280">${exp.category} &middot; ${dist.toFixed(1)} km</div>
              <div style="margin-top:4px;font-size:11px;font-weight:600;color:${color}">${isActive ? '● Visible' : '○ Hidden'}</div>
            </div>
          `);

        markersRef.current.push(marker);
      });
    });
  }, [experiences, radiusKm, hotelLat, hotelLng, mapReady]);

  return (
    <div className="rounded-2xl overflow-hidden relative border border-bored-gray-200" style={{ height: 380 }}>
      <div ref={mapRef} style={{ height: '100%', width: '100%' }} />
      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-[1000] rounded-xl px-3 py-2.5 text-[11px] space-y-1.5" style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)', border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
        <div className="flex items-center gap-2 text-bored-gray-700 font-medium"><span className="w-2.5 h-2.5 rounded-full bg-[#16a34a] inline-block"></span> Visible &amp; within radius</div>
        <div className="flex items-center gap-2 text-bored-gray-700"><span className="w-2.5 h-2.5 rounded-full bg-[#ea580c] inline-block"></span> Visible but outside radius</div>
        <div className="flex items-center gap-2 text-bored-gray-400"><span className="w-2.5 h-2.5 rounded-full bg-[#94a3b8] inline-block"></span> Hidden</div>
        <div className="flex items-center gap-2 text-bored-gray-700"><span className="w-2.5 h-2.5 rounded-full bg-[#18181b] inline-block"></span> Hotel</div>
      </div>
    </div>
  );
};
