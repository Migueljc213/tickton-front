'use client';

import { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { FaMapMarkerAlt, FaExternalLinkAlt, FaSpinner } from 'react-icons/fa';

const MapView = dynamic(() => import('./MapView'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100">
      <FaSpinner className="animate-spin text-turquoise text-2xl" />
    </div>
  ),
});

interface Props {
  venueName?: string;
  address?: string;
  city?: string;
  state?: string;
}

interface Coords {
  lat: number;
  lng: number;
}

async function geocode(query: string): Promise<Coords | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`,
      { headers: { 'Accept-Language': 'pt-BR' } },
    );
    const data = await res.json();
    if (data.length === 0) return null;
    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
  } catch {
    return null;
  }
}

export default function EventMapCard({ venueName, address, city, state }: Props) {
  const [coords, setCoords] = useState<Coords | null>(null);
  const [geocoding, setGeocoding] = useState(true);
  const [failed, setFailed] = useState(false);

  const fullAddress = useMemo(
    () => [venueName, address, city, state].filter(Boolean).join(', '),
    [venueName, address, city, state],
  );
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;

  useEffect(() => {
    if (!fullAddress) {
      setGeocoding(false);
      return;
    }
    setGeocoding(true);
    setFailed(false);

    geocode(fullAddress).then((result) => {
      if (result) {
        setCoords(result);
        return;
      }
      const fallback = [city, state].filter(Boolean).join(', ');
      if (fallback) {
        return geocode(fallback).then((r) => {
          if (r) setCoords(r);
          else setFailed(true);
        });
      }
      setFailed(true);
    }).finally(() => setGeocoding(false));
  }, [fullAddress, city, state]);

  if (!fullAddress) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-5 pb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <span className="w-1 h-5 bg-turquoise rounded-full" />
          Localização
        </h2>
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-turquoise hover:text-turquoise-600 transition-colors"
        >
          Abrir no Google Maps
          <FaExternalLinkAlt className="text-xs" />
        </a>
      </div>

      {/* Map area */}
      <div className="relative h-64 bg-gray-100">
        {geocoding && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
            <FaSpinner className="animate-spin text-turquoise text-2xl" />
          </div>
        )}

        {!geocoding && coords && (
          <MapView
            lat={coords.lat}
            lng={coords.lng}
            popupLabel={venueName || fullAddress}
            mapsUrl={mapsUrl}
          />
        )}

        {!geocoding && failed && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gray-50">
            <FaMapMarkerAlt className="text-4xl text-gray-300" />
            <p className="text-sm text-gray-400">Mapa indisponível para este endereço</p>
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-turquoise text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-turquoise-600 transition-colors"
            >
              <FaExternalLinkAlt className="text-xs" />
              Abrir no Google Maps
            </a>
          </div>
        )}
      </div>

      {/* Address footer */}
      <div className="px-6 py-4 flex items-start gap-3 border-t border-gray-50">
        <div className="w-8 h-8 bg-turquoise/10 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
          <FaMapMarkerAlt className="text-turquoise text-sm" />
        </div>
        <div>
          {venueName && <p className="font-bold text-gray-900 text-sm">{venueName}</p>}
          {address && <p className="text-sm text-gray-600">{address}</p>}
          {(city || state) && (
            <p className="text-sm text-gray-500">{[city, state].filter(Boolean).join(' - ')}</p>
          )}
        </div>
      </div>
    </div>
  );
}
