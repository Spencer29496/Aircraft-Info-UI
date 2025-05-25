'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Aircraft {
  tailNumber: string;
  model: string;
  status: 'available' | 'aog' | 'maintenance';
  location: {
    latitude: number;
    longitude: number;
  };
}

interface LeafletMapProps {
  aircraftData: Aircraft[];
  onAircraftClick?: (tailNumber: string) => void;
}

// Fix default marker icons for react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Create custom marker icons for different statuses
const createMarkerIcon = (status: Aircraft['status']) => {
  const colors = {
    available: { bg: '#10b981', border: '#065f46', shadow: 'rgba(16, 185, 129, 0.4)' },
    maintenance: { bg: '#f59e0b', border: '#92400e', shadow: 'rgba(245, 158, 11, 0.4)' },
    aog: { bg: '#ef4444', border: '#991b1b', shadow: 'rgba(239, 68, 68, 0.4)' }
  };
  
  const colorScheme = colors[status];
  
  return L.divIcon({
    html: `
      <div style="
        background: linear-gradient(135deg, ${colorScheme.bg}, ${colorScheme.border});
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 4px 12px ${colorScheme.shadow}, 0 2px 4px rgba(0,0,0,0.1);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 10px;
        font-weight: bold;
        position: relative;
        transition: all 0.2s ease;
      " onmouseover="this.style.transform='scale(1.2)'" onmouseout="this.style.transform='scale(1)'">
        ✈
        <div style="
          position: absolute;
          top: -2px;
          right: -2px;
          width: 8px;
          height: 8px;
          background: ${status === 'available' ? '#22c55e' : status === 'maintenance' ? '#eab308' : '#f87171'};
          border: 2px solid white;
          border-radius: 50%;
          animation: pulse 2s infinite;
        "></div>
      </div>
      <style>
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.5); opacity: 0.5; }
          100% { transform: scale(1); opacity: 1; }
        }
      </style>
    `,
    className: 'custom-aircraft-marker',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15],
  });
};

// Component to fit map bounds to markers
function FitBounds({ aircraftData }: { aircraftData: Aircraft[] }) {
  const map = useMap();
  
  useEffect(() => {
    if (aircraftData.length > 0) {
      const bounds = L.latLngBounds(
        aircraftData.map(aircraft => [aircraft.location.latitude, aircraft.location.longitude])
      );
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [aircraftData, map]);
  
  return null;
}

export default function LeafletMap({ aircraftData, onAircraftClick }: LeafletMapProps) {
  // Set up global function for popup button clicks
  useEffect(() => {
    (window as any).selectAircraft = (tailNumber: string) => {
      if (onAircraftClick) {
        onAircraftClick(tailNumber);
      }
    };

    return () => {
      if ((window as any).selectAircraft) {
        delete (window as any).selectAircraft;
      }
    };
  }, [onAircraftClick]);

  const statusColors = {
    available: '#10b981',
    maintenance: '#f59e0b',
    aog: '#ef4444'
  };

  const statusLabels = {
    available: 'Available',
    maintenance: 'In Maintenance',
    aog: 'Aircraft on Ground'
  };

  return (
    <MapContainer
      center={[39.8283, -98.5795]} // Center of US
      zoom={4}
      style={{ height: '100%', width: '100%' }}
      className="rounded-lg"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        maxZoom={18}
      />
      
      <FitBounds aircraftData={aircraftData} />
      
      {aircraftData.map((aircraft) => (
        <Marker
          key={aircraft.tailNumber}
          position={[aircraft.location.latitude, aircraft.location.longitude]}
          icon={createMarkerIcon(aircraft.status)}
        >
          <Popup maxWidth={300} className="custom-popup">
            <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', minWidth: '220px', padding: '4px' }}>
              <div style={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                color: 'white', 
                margin: '-8px -12px 12px -12px', 
                padding: '16px', 
                borderRadius: '8px 8px 0 0' 
              }}>
                <h3 style={{ 
                  margin: 0, 
                  fontSize: '18px', 
                  fontWeight: 700, 
                  display: 'flex', 
                  alignItems: 'center' 
                }}>
                  <span style={{ marginRight: '8px' }}>✈</span>
                  {aircraft.tailNumber}
                </h3>
              </div>
              
              <div style={{ padding: '0 4px' }}>
                <div style={{ margin: '12px 0', display: 'flex', alignItems: 'center' }}>
                  <div style={{ 
                    width: '32px', 
                    height: '32px', 
                    background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', 
                    borderRadius: '8px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    marginRight: '12px' 
                  }}>
                    <span style={{ color: 'white', fontSize: '14px' }}>🛩</span>
                  </div>
                  <div>
                    <p style={{ 
                      margin: 0, 
                      color: '#6B7280', 
                      fontSize: '12px', 
                      fontWeight: 600, 
                      textTransform: 'uppercase', 
                      letterSpacing: '0.5px' 
                    }}>Aircraft Model</p>
                    <p style={{ 
                      margin: '2px 0 0 0', 
                      color: '#374151', 
                      fontSize: '15px', 
                      fontWeight: 600 
                    }}>{aircraft.model}</p>
                  </div>
                </div>
                
                <div style={{ margin: '12px 0', display: 'flex', alignItems: 'center' }}>
                  <div style={{ 
                    width: '32px', 
                    height: '32px', 
                    background: `linear-gradient(135deg, ${statusColors[aircraft.status]}, ${statusColors[aircraft.status]}dd)`, 
                    borderRadius: '8px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    marginRight: '12px' 
                  }}>
                    <span style={{ color: 'white', fontSize: '12px' }}>
                      {aircraft.status === 'available' ? '✓' : aircraft.status === 'maintenance' ? '⚙' : '⚠'}
                    </span>
                  </div>
                  <div>
                    <p style={{ 
                      margin: 0, 
                      color: '#6B7280', 
                      fontSize: '12px', 
                      fontWeight: 600, 
                      textTransform: 'uppercase', 
                      letterSpacing: '0.5px' 
                    }}>Status</p>
                    <p style={{ 
                      margin: '2px 0 0 0', 
                      color: statusColors[aircraft.status], 
                      fontSize: '15px', 
                      fontWeight: 700 
                    }}>
                      {statusLabels[aircraft.status]}
                    </p>
                  </div>
                </div>
                
                <div style={{ margin: '12px 0', display: 'flex', alignItems: 'center' }}>
                  <div style={{ 
                    width: '32px', 
                    height: '32px', 
                    background: 'linear-gradient(135deg, #06b6d4, #0891b2)', 
                    borderRadius: '8px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    marginRight: '12px' 
                  }}>
                    <span style={{ color: 'white', fontSize: '14px' }}>📍</span>
                  </div>
                  <div>
                    <p style={{ 
                      margin: 0, 
                      color: '#6B7280', 
                      fontSize: '12px', 
                      fontWeight: 600, 
                      textTransform: 'uppercase', 
                      letterSpacing: '0.5px' 
                    }}>Location</p>
                    <p style={{ 
                      margin: '2px 0 0 0', 
                      color: '#374151', 
                      fontSize: '13px', 
                      fontFamily: 'ui-monospace, monospace', 
                      fontWeight: 500 
                    }}>
                      {aircraft.location.latitude.toFixed(4)}, {aircraft.location.longitude.toFixed(4)}
                    </p>
                  </div>
                </div>
                
                <button 
                  onClick={() => {
                    if ((window as any).selectAircraft) {
                      (window as any).selectAircraft(aircraft.tailNumber);
                    }
                  }}
                  style={{
                    marginTop: '16px',
                    padding: '12px 16px',
                    background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    width: '100%',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 2px 4px rgba(59, 130, 246, 0.3)',
                  }}
                  onMouseOver={(e) => {
                    const target = e.target as HTMLButtonElement;
                    target.style.background = 'linear-gradient(135deg, #2563EB, #1E40AF)';
                    target.style.transform = 'translateY(-1px)';
                    target.style.boxShadow = '0 4px 8px rgba(59, 130, 246, 0.4)';
                  }}
                  onMouseOut={(e) => {
                    const target = e.target as HTMLButtonElement;
                    target.style.background = 'linear-gradient(135deg, #3B82F6, #1D4ED8)';
                    target.style.transform = 'translateY(0)';
                    target.style.boxShadow = '0 2px 4px rgba(59, 130, 246, 0.3)';
                  }}
                >
                  View in Aircraft List →
                </button>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
} 