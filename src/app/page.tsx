'use client';

import { useState, useEffect, useRef } from 'react';
import AircraftMap from './components/AircraftMap';

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
  const baseClasses = "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wide shadow-sm";
  
  switch (status) {
    case 'available':
      return `${baseClasses} bg-gradient-to-r from-emerald-400 to-green-500 text-white`;
    case 'maintenance':
      return `${baseClasses} bg-gradient-to-r from-amber-400 to-yellow-500 text-white`;
    case 'aog':
      return `${baseClasses} bg-gradient-to-r from-red-400 to-red-600 text-white`;
    default:
      return `${baseClasses} bg-gradient-to-r from-gray-400 to-gray-500 text-white`;
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
  const [highlightedAircraft, setHighlightedAircraft] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const tableRef = useRef<HTMLDivElement>(null);

  // Ensure we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Fetch aircraft data on component mount
  useEffect(() => {
    if (!isClient) return; // Only run on client side

    async function fetchAircraftData() {
      try {
        // First, try to get data from localStorage
        const storedData = localStorage.getItem('aircraftData');
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          setAircraftData(parsedData);
          setFilteredData(parsedData);
          setLoading(false);
          return;
        }

        // If no stored data, fetch from API and store in localStorage
        const response = await fetch('/api/aircraft');
        const data = await response.json();
        setAircraftData(data);
        setFilteredData(data);
        
        // Store in localStorage for future use
        localStorage.setItem('aircraftData', JSON.stringify(data));
        setLoading(false);
      } catch (error) {
        console.error('Error fetching aircraft data:', error);
        setLoading(false);
      }
    }
    
    fetchAircraftData();
  }, [isClient]);

  // Update aircraft status using localStorage
  const updateAircraftStatus = async (tailNumber: string, newStatus: 'available' | 'aog' | 'maintenance') => {
    setIsUpdating(true);
    try {
      // Update the local state immediately for better UX
      const updatedAircraftData = aircraftData.map(aircraft =>
        aircraft.tailNumber === tailNumber 
          ? { ...aircraft, status: newStatus }
          : aircraft
      );
      
      setAircraftData(updatedAircraftData);
      setEditingAircraft(null);
      
      // Persist to localStorage only on client side
      if (isClient) {
        localStorage.setItem('aircraftData', JSON.stringify(updatedAircraftData));
      }
    } catch (error) {
      console.error('Error updating aircraft status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Reset to original data from API
  const resetToOriginalData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/aircraft');
      const data = await response.json();
      setAircraftData(data);
      setFilteredData(data);
      
      // Update localStorage with original data only on client side
      if (isClient) {
        localStorage.setItem('aircraftData', JSON.stringify(data));
      }
      setLoading(false);
    } catch (error) {
      console.error('Error resetting aircraft data:', error);
      setLoading(false);
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

  // Handle aircraft selection from map
  const handleAircraftClick = (tailNumber: string) => {
    // Clear filters to make sure the aircraft is visible
    setTailNumberFilter('');
    setModelFilter('');
    setStatusFilter('');
    
    // Highlight the aircraft
    setHighlightedAircraft(tailNumber);
    
    // Scroll to the aircraft table
    if (tableRef.current) {
      tableRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    
    // Remove highlight after 3 seconds
    setTimeout(() => {
      setHighlightedAircraft(null);
    }, 3000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <div className="text-xl text-gray-700 font-medium">Loading aircraft data...</div>
          <div className="text-sm text-gray-500 mt-2">Preparing your aircraft management dashboard</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header with background */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-xl">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white bg-opacity-20 rounded-full mb-4">
              <svg className="w-10 h-10 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
              </svg>
            </div>
            <h1 className="text-5xl font-bold mb-4 tracking-tight">
              Aircraft Information System
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Monitor, track, and manage your aircraft fleet with real-time updates and intuitive controls
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Summary Cards */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="group bg-white p-6 rounded-xl shadow-lg border-0 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-600 text-sm uppercase tracking-wider mb-2">Available Aircraft</h3>
                <p className="text-4xl font-bold bg-gradient-to-r from-emerald-500 to-green-600 bg-clip-text text-transparent">
                  {filteredData.filter(aircraft => aircraft.status === 'available').length}
                </p>
                <p className="text-sm text-gray-500 mt-1">Ready for service</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
              </div>
            </div>
          </div>

          <div className="group bg-white p-6 rounded-xl shadow-lg border-0 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-600 text-sm uppercase tracking-wider mb-2">AOG Status</h3>
                <p className="text-4xl font-bold bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent">
                  {filteredData.filter(aircraft => aircraft.status === 'aog').length}
                </p>
                <p className="text-sm text-gray-500 mt-1">Aircraft on ground</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-red-400 to-red-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                </svg>
              </div>
            </div>
          </div>

          <div className="group bg-white p-6 rounded-xl shadow-lg border-0 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-600 text-sm uppercase tracking-wider mb-2">In Maintenance</h3>
                <p className="text-4xl font-bold bg-gradient-to-r from-amber-500 to-yellow-600 bg-clip-text text-transparent">
                  {filteredData.filter(aircraft => aircraft.status === 'maintenance').length}
                </p>
                <p className="text-sm text-gray-500 mt-1">Under service</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"/>
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Aircraft Map */}
        <div className="mb-8">
          <AircraftMap 
            aircraftData={filteredData} 
            onAircraftClick={handleAircraftClick}
          />
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8 border-0">
          <div className="flex items-center mb-6">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd"/>
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-800">Filter Aircraft</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Tail Number Filter */}
            <div className="space-y-2">
              <label htmlFor="tailNumber" className="block text-sm font-semibold text-gray-700">
                Tail Number
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="tailNumber"
                  placeholder="Search by tail number..."
                  value={tailNumberFilter}
                  onChange={(e) => setTailNumberFilter(e.target.value)}
                  className="w-full px-4 py-3 pl-10 border-2 border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                />
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
                </svg>
              </div>
            </div>

            {/* Model Filter */}
            <div className="space-y-2">
              <label htmlFor="model" className="block text-sm font-semibold text-gray-700">
                Aircraft Model
              </label>
              <select
                id="model"
                value={modelFilter}
                onChange={(e) => setModelFilter(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white"
              >
                <option value="">All Models</option>
                {uniqueModels.map(model => (
                  <option key={model} value={model}>{model}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <label htmlFor="status" className="block text-sm font-semibold text-gray-700">
                Status
              </label>
              <select
                id="status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white"
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

          {/* Clear Filters and Reset Data Buttons */}
          <div className="mt-6 flex items-center space-x-4">
            {(tailNumberFilter || modelFilter || statusFilter) && (
              <button
                onClick={() => {
                  setTailNumberFilter('');
                  setModelFilter('');
                  setStatusFilter('');
                }}
                className="px-6 py-3 bg-gradient-to-r from-gray-400 to-gray-500 text-white font-medium rounded-lg hover:from-gray-500 hover:to-gray-600 transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
              >
                Clear All Filters
              </button>
            )}
            <button
              onClick={resetToOriginalData}
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? 'Resetting...' : 'Reset to Original Data'}
            </button>
          </div>
        </div>

        {/* Aircraft Table */}
        <div ref={tableRef} className="bg-white rounded-xl shadow-lg overflow-hidden border-0">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                  <svg className="w-6 h-6 mr-3 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  Aircraft Fleet
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Showing <span className="font-semibold text-indigo-600">{filteredData.length}</span> of <span className="font-semibold">{aircraftData.length}</span> aircraft
                </p>
              </div>
              <div className="bg-white px-4 py-2 rounded-lg shadow-sm border">
                <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Quick Actions</p>
                <p className="text-sm text-gray-700 mt-1">Click any row to update status</p>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-8 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Tail Number
                  </th>
                  <th className="px-8 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Aircraft Model
                  </th>
                  <th className="px-8 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-8 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Location
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-8 py-12 text-center">
                      <div className="text-gray-400 mb-2">
                        <svg className="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                        </svg>
                      </div>
                      <p className="text-gray-500 text-lg font-medium">No aircraft match the current filters</p>
                      <p className="text-gray-400 text-sm mt-1">Try adjusting your search criteria</p>
                    </td>
                  </tr>
                ) : (
                  filteredData.map((aircraft, index) => (
                    <tr 
                      key={aircraft.tailNumber} 
                      className={`hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 cursor-pointer group ${
                        highlightedAircraft === aircraft.tailNumber 
                          ? 'bg-gradient-to-r from-blue-100 to-indigo-100 ring-2 ring-blue-300 ring-inset' 
                          : index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      }`}
                      onClick={() => setEditingAircraft(aircraft.tailNumber)}
                    >
                      <td className="px-8 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-gray-900 group-hover:text-indigo-600 transition-colors duration-200">
                          {aircraft.tailNumber}
                        </div>
                      </td>
                      <td className="px-8 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-700 font-medium">
                          {aircraft.model}
                        </div>
                      </td>
                      <td className="px-8 py-4 whitespace-nowrap">
                        {editingAircraft === aircraft.tailNumber ? (
                          <div className="flex items-center space-x-3">
                            <select
                              value={aircraft.status}
                              onChange={(e) => updateAircraftStatus(aircraft.tailNumber, e.target.value as 'available' | 'aog' | 'maintenance')}
                              onClick={(e) => e.stopPropagation()}
                              disabled={isUpdating}
                              className="text-sm px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 bg-white shadow-sm"
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
                              className="text-sm px-3 py-2 text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
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
                      <td className="px-8 py-4 whitespace-nowrap text-sm text-gray-700 font-mono">
                        {formatLocation(aircraft.location.latitude, aircraft.location.longitude)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center py-8">
          <div className="text-gray-500 text-sm">
            <p className="mb-2">Aircraft Information System • Real-time Fleet Management</p>
            <p>Powered by modern web technologies for optimal performance</p>
          </div>
        </div>
      </div>
    </div>
  );
}
