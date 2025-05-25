'use client';

import dynamic from 'next/dynamic';
import { ComponentType } from 'react';

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

// Create the map component that will be dynamically imported
const LeafletMapComponent: ComponentType<AircraftMapProps> = dynamic(
  () => import('./LeafletMap'),
  {
    ssr: false,
    loading: () => (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border-0">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Aircraft Map</h2>
              <p className="text-sm text-gray-600 mt-1">
                Interactive fleet visualization with real-time status indicators
              </p>
            </div>
          </div>
        </div>
        
        <div className="h-96 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
            <div className="text-gray-600 font-medium">Loading interactive map...</div>
            <div className="text-sm text-gray-500 mt-1">Preparing aircraft locations</div>
          </div>
        </div>
        
        <div className="px-8 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full mr-2"></div>
                <span className="text-gray-600 font-medium">Available</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full mr-2"></div>
                <span className="text-gray-600 font-medium">Maintenance</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-gradient-to-r from-red-400 to-red-600 rounded-full mr-2"></div>
                <span className="text-gray-600 font-medium">AOG</span>
              </div>
            </div>
            <div className="text-gray-500">
              Click markers for aircraft details
            </div>
          </div>
        </div>
      </div>
    )
  }
);

export default function AircraftMap({ aircraftData, onAircraftClick }: AircraftMapProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border-0">
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Aircraft Map</h2>
              <p className="text-sm text-gray-600 mt-1">
                Interactive fleet visualization • <span className="font-semibold text-indigo-600">{aircraftData.length}</span> aircraft displayed
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="bg-white px-4 py-2 rounded-lg shadow-sm border">
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Map Controls</p>
              <p className="text-sm text-gray-700 mt-1">Zoom & pan to explore</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="h-96">
        <LeafletMapComponent aircraftData={aircraftData} onAircraftClick={onAircraftClick} />
      </div>
      
      <div className="px-8 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-6">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full mr-2 shadow-sm"></div>
              <span className="text-gray-700 font-semibold">Available</span>
              <span className="ml-2 text-gray-500">({aircraftData.filter(a => a.status === 'available').length})</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full mr-2 shadow-sm"></div>
              <span className="text-gray-700 font-semibold">Maintenance</span>
              <span className="ml-2 text-gray-500">({aircraftData.filter(a => a.status === 'maintenance').length})</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-gradient-to-r from-red-400 to-red-600 rounded-full mr-2 shadow-sm"></div>
              <span className="text-gray-700 font-semibold">AOG</span>
              <span className="ml-2 text-gray-500">({aircraftData.filter(a => a.status === 'aog').length})</span>
            </div>
          </div>
          <div className="text-gray-500 flex items-center">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
            </svg>
            Click markers for details
          </div>
        </div>
      </div>
    </div>
  );
} 