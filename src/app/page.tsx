import { promises as fs } from 'fs';
import path from 'path';

interface Aircraft {
  tailNumber: string;
  model: string;
  status: 'available' | 'aog' | 'maintenance';
  location: {
    latitude: number;
    longitude: number;
  };
}

async function getAircraftData(): Promise<Aircraft[]> {
  const filePath = path.join(process.cwd(), 'data', 'aircraft.json');
  const fileContents = await fs.readFile(filePath, 'utf8');
  return JSON.parse(fileContents);
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

export default async function Home() {
  const aircraftData = await getAircraftData();

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
              {aircraftData.filter(aircraft => aircraft.status === 'available').length}
            </p>
          </div>
          <div className="bg-red-50 p-6 rounded-lg border border-red-200">
            <h3 className="font-semibold text-red-800 text-sm uppercase tracking-wide">AOG</h3>
            <p className="text-3xl font-bold text-red-600 mt-2">
              {aircraftData.filter(aircraft => aircraft.status === 'aog').length}
            </p>
          </div>
          <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
            <h3 className="font-semibold text-yellow-800 text-sm uppercase tracking-wide">Maintenance</h3>
            <p className="text-3xl font-bold text-yellow-600 mt-2">
              {aircraftData.filter(aircraft => aircraft.status === 'maintenance').length}
            </p>
          </div>
        </div>

        {/* Aircraft Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">
              Aircraft Fleet ({aircraftData.length} aircraft)
            </h2>
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
                {aircraftData.map((aircraft) => (
                  <tr key={aircraft.tailNumber} className="hover:bg-gray-50 transition-colors">
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
                      <span className={getStatusBadge(aircraft.status)}>
                        {aircraft.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatLocation(aircraft.location.latitude, aircraft.location.longitude)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
