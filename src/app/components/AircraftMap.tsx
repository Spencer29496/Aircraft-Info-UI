'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';

interface Aircraft {
  tailNumber: string;
  model: string;
  status: 'available' | 'aog' | 'maintenance';
  location: {
    latitude: number;
    longitude: number;
  };
}

interface AircraftMapProps {
  aircraftData: Aircraft[];
  onAircraftClick?: (tailNumber: string) => void;
}

// Define custom marker icons with different colors for each status
const createMarkerIcon = (L: any, status: Aircraft['status']) => {
  const color = status === 'available' ? '#10b981' : 
               status === 'maintenance' ? '#f59e0b' : '#ef4444';
  
  return L.divIcon({
    html: `
      <div style="
        background-color: ${color};
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 10px;
        font-weight: bold;
      ">✈</div>
    `,
    className: 'custom-aircraft-marker',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });
};

function AircraftMapComponent({ aircraftData, onAircraftClick }: AircraftMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [L, setL] = useState<any>(null);

  // Dynamically import Leaflet on client side only
  useEffect(() => {
    const loadLeaflet = async () => {
      try {
        const leaflet = await import('leaflet');
        // Import CSS styles
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.css';
        document.head.appendChild(link);
        
        setL(leaflet.default);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load Leaflet:', error);
        setIsLoading(false);
      }
    };

    loadLeaflet();
  }, []);

  useEffect(() => {
    if (!mapRef.current || !L || isLoading) return;

    // Initialize map only once
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current).setView([39.8283, -98.5795], 4); // Center of US

      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapInstanceRef.current);
    }

    // Clear existing markers
    markersRef.current.forEach(marker => {
      mapInstanceRef.current?.removeLayer(marker);
    });
    markersRef.current = [];

    // Add markers for each aircraft
    aircraftData.forEach(aircraft => {
      if (!mapInstanceRef.current) return;

      const marker = L.marker(
        [aircraft.location.latitude, aircraft.location.longitude],
        { icon: createMarkerIcon(L, aircraft.status) }
      );

      // Create popup content
      const popupContent = `
        <div style="font-family: sans-serif; min-width: 200px;">
          <h3 style="margin: 0 0 8px 0; color: #374151; font-size: 16px; font-weight: 600;">
            ${aircraft.tailNumber}
          </h3>
          <p style="margin: 4px 0; color: #6B7280; font-size: 14px;">
            <strong>Model:</strong> ${aircraft.model}
          </p>
          <p style="margin: 4px 0; color: #6B7280; font-size: 14px;">
            <strong>Status:</strong> 
            <span style="
              display: inline-block; 
              margin-left: 8px; 
              padding: 2px 8px; 
              border-radius: 12px; 
              font-size: 12px; 
              font-weight: 500;
              background-color: ${aircraft.status === 'available' ? '#D1FAE5' : 
                                 aircraft.status === 'maintenance' ? '#FEF3C7' : '#FEE2E2'};
              color: ${aircraft.status === 'available' ? '#065F46' : 
                       aircraft.status === 'maintenance' ? '#92400E' : '#991B1B'};
            ">
              ${aircraft.status.toUpperCase()}
            </span>
          </p>
          <p style="margin: 4px 0; color: #6B7280; font-size: 14px;">
            <strong>Location:</strong> ${aircraft.location.latitude.toFixed(4)}, ${aircraft.location.longitude.toFixed(4)}
          </p>
          <button 
            onclick="window.selectAircraft && window.selectAircraft('${aircraft.tailNumber}')"
            style="
              margin-top: 8px;
              padding: 6px 12px;
              background-color: #3B82F6;
              color: white;
              border: none;
              border-radius: 4px;
              font-size: 12px;
              font-weight: 500;
              cursor: pointer;
              width: 100%;
            "
            onmouseover="this.style.backgroundColor='#2563EB'"
            onmouseout="this.style.backgroundColor='#3B82F6'"
          >
            View in Aircraft List
          </button>
        </div>
      `;

      marker.bindPopup(popupContent);
      marker.addTo(mapInstanceRef.current);
      markersRef.current.push(marker);
    });

    // Set up global function for popup button clicks
    (window as any).selectAircraft = (tailNumber: string) => {
      if (onAircraftClick) {
        onAircraftClick(tailNumber);
      }
    };

    // Auto-fit bounds if there are aircraft
    if (aircraftData.length > 0 && mapInstanceRef.current) {
      const group = new L.FeatureGroup(markersRef.current);
      mapInstanceRef.current.fitBounds(group.getBounds().pad(0.1));
    }

  }, [aircraftData, onAircraftClick, L, isLoading]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      // Clean up global function
      if ((window as any).selectAircraft) {
        delete (window as any).selectAircraft;
      }
    };
  }, []);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Aircraft Map</h2>
          <p className="text-sm text-gray-600 mt-1">
            Aircraft locations with status-based colors. Click markers for details.
          </p>
          <div className="mt-3 flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <span className="text-gray-600">Available</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
              <span className="text-gray-600">Maintenance</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-500 rounded-full"></div>
              <span className="text-gray-600">AOG</span>
            </div>
          </div>
        </div>
        <div className="h-96 w-full flex items-center justify-center bg-gray-50" style={{ minHeight: '400px' }}>
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Loading map...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">Aircraft Map</h2>
        <p className="text-sm text-gray-600 mt-1">
          Aircraft locations with status-based colors. Click markers for details.
        </p>
        <div className="mt-3 flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
            <span className="text-gray-600">Available</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
            <span className="text-gray-600">Maintenance</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-500 rounded-full"></div>
            <span className="text-gray-600">AOG</span>
          </div>
        </div>
      </div>
      <div 
        ref={mapRef} 
        className="h-96 w-full"
        style={{ minHeight: '400px' }}
      />
    </div>
  );
}

// Export with dynamic import to prevent SSR
export default dynamic(() => Promise.resolve(AircraftMapComponent), {
  ssr: false,
  loading: () => (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">Aircraft Map</h2>
        <p className="text-sm text-gray-600 mt-1">
          Loading map component...
        </p>
      </div>
      <div className="h-96 w-full flex items-center justify-center bg-gray-50" style={{ minHeight: '400px' }}>
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Initializing map...</p>
        </div>
      </div>
    </div>
  )
}); 