'use client';

import { useState, useEffect } from 'react';

interface Aircraft {
  tailNumber: string;
  model: string;
  status: 'available' | 'aog' | 'maintenance';
  location: {
    latitude: number;
    longitude: number;
  };
}

function getStatusBadge(status: string) {
  const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
  
  switch (status) {
    case 'available':
      return `${baseClasses} bg-green-100 text-green-800`;
    case 'maintenance':
      return `${baseClasses} bg-yellow-100 text-yellow-800`;
    case 'aog':
      return `${baseClasses} bg-red-100 text-red-800`;
    default:
      return `${baseClasses} bg-gray-100 text-gray-800`;
  }
}

function formatLocation(latitude: number, longitude: number) {
  return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
}

export default function Home() {
  const [aircraftData, setAircraftData] = useState<Aircraft[]>([]);
  const [filteredData, setFilteredData] = useState<Aircraft[]>([]);
  const [tailNumberFilter, setTailNumberFilter] = useState('');
  const [modelFilter, setModelFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingAircraft, setEditingAircraft] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch aircraft data on component mount
  useEffect(() => {
    async function fetchAircraftData() {
      try {
        const response = await fetch('/api/aircraft');
        const data = await response.json();
        setAircraftData(data);
        setFilteredData(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching aircraft data:', error);
        setLoading(false);
      }
    }
    
    fetchAircraftData();
  }, []);

  // Update aircraft status
  const updateAircraftStatus = async (tailNumber: string, newStatus: 'available' | 'aog' | 'maintenance') => {
    setIsUpdating(true);
    try {
      const response = await fetch('/api/aircraft', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tailNumber, status: newStatus }),
      });

      if (response.ok) {
        // Update the local state immediately for better UX
        const updatedAircraftData = aircraftData.map(aircraft =>
          aircraft.tailNumber === tailNumber 
            ? { ...aircraft, status: newStatus }
            : aircraft
        );
        setAircraftData(updatedAircraftData);
        setEditingAircraft(null);
      } else {
        console.error('Failed to update aircraft status');
      }
    } catch (error) {
      console.error('Error updating aircraft status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Apply filters whenever filter values or aircraft data changes
  useEffect(() => {
    let filtered = aircraftData;

    // Filter by tail number (contains)
    if (tailNumberFilter) {
      filtered = filtered.filter(aircraft =>
        aircraft.tailNumber.toLowerCase().includes(tailNumberFilter.toLowerCase())
      );
    }

    // Filter by model
    if (modelFilter) {
      filtered = filtered.filter(aircraft => aircraft.model === modelFilter);
    }

    // Filter by status
    if (statusFilter) {
      filtered = filtered.filter(aircraft => aircraft.status === statusFilter);
    }

    setFilteredData(filtered);
  }, [aircraftData, tailNumberFilter, modelFilter, statusFilter]);

  // Get unique models and statuses for dropdown options
  const uniqueModels = [...new Set(aircraftData.map(aircraft => aircraft.model))].sort();
  const uniqueStatuses = [...new Set(aircraftData.map(aircraft => aircraft.status))].sort();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading aircraft data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Aircraft Information System
          </h1>
          <p className="text-gray-600">
            "How many of my aircraft are ready to fly right now, and which ones are they?"
          </p>
        </header>
        
        {/* Summary Cards */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 p-6 rounded-lg border border-green-200">
            <h3 className="font-semibold text-green-800 text-sm uppercase tracking-wide">Available</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {filteredData.filter(aircraft => aircraft.status === 'available').length}
            </p>
          </div>
          <div className="bg-red-50 p-6 rounded-lg border border-red-200">
            <h3 className="font-semibold text-red-800 text-sm uppercase tracking-wide">AOG</h3>
            <p className="text-3xl font-bold text-red-600 mt-2">
              {filteredData.filter(aircraft => aircraft.status === 'aog').length}
            </p>
          </div>
          <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
            <h3 className="font-semibold text-yellow-800 text-sm uppercase tracking-wide">Maintenance</h3>
            <p className="text-3xl font-bold text-yellow-600 mt-2">
              {filteredData.filter(aircraft => aircraft.status === 'maintenance').length}
            </p>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Filter Aircraft</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Tail Number Filter */}
            <div>
              <label htmlFor="tailNumber" className="block text-sm font-medium text-gray-700 mb-2">
                Tail Number
              </label>
              <input
                type="text"
                id="tailNumber"
                placeholder="Search by tail number..."
                value={tailNumberFilter}
                onChange={(e) => setTailNumberFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Model Filter */}
            <div>
              <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-2">
                Aircraft Model
              </label>
              <select
                id="model"
                value={modelFilter}
                onChange={(e) => setModelFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Models</option>
                {uniqueModels.map(model => (
                  <option key={model} value={model}>{model}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                id="status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Statuses</option>
                {uniqueStatuses.map(status => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Clear Filters Button */}
          {(tailNumberFilter || modelFilter || statusFilter) && (
            <div className="mt-4">
              <button
                onClick={() => {
                  setTailNumberFilter('');
                  setModelFilter('');
                  setStatusFilter('');
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>

        {/* Aircraft Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">
              Aircraft Fleet ({filteredData.length} of {aircraftData.length} aircraft)
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Click on any aircraft row to update its status
            </p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tail Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aircraft Model
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                      No aircraft match the current filters.
                    </td>
                  </tr>
                ) : (
                  filteredData.map((aircraft) => (
                    <tr 
                      key={aircraft.tailNumber} 
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => setEditingAircraft(aircraft.tailNumber)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {aircraft.tailNumber}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {aircraft.model}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingAircraft === aircraft.tailNumber ? (
                          <div className="flex items-center space-x-2">
                            <select
                              value={aircraft.status}
                              onChange={(e) => updateAircraftStatus(aircraft.tailNumber, e.target.value as 'available' | 'aog' | 'maintenance')}
                              onClick={(e) => e.stopPropagation()}
                              disabled={isUpdating}
                              className="text-xs px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                            >
                              <option value="available">Available</option>
                              <option value="aog">AOG</option>
                              <option value="maintenance">Maintenance</option>
                            </select>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingAircraft(null);
                              }}
                              className="text-xs px-2 py-1 text-gray-500 hover:text-gray-700"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <span className={getStatusBadge(aircraft.status)}>
                            {aircraft.status.toUpperCase()}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatLocation(aircraft.location.latitude, aircraft.location.longitude)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
