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
            Displaying aircraft data in JSON format
          </p>
        </header>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Aircraft Data ({aircraftData.length} records)
          </h2>
          
          <div className="bg-gray-900 rounded-lg p-4 overflow-auto">
            <pre className="text-green-400 text-sm whitespace-pre-wrap">
              {JSON.stringify(aircraftData, null, 2)}
            </pre>
          </div>
          
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800">Available</h3>
              <p className="text-2xl font-bold text-blue-600">
                {aircraftData.filter(aircraft => aircraft.status === 'available').length}
              </p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <h3 className="font-semibold text-red-800">AOG</h3>
              <p className="text-2xl font-bold text-red-600">
                {aircraftData.filter(aircraft => aircraft.status === 'aog').length}
              </p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="font-semibold text-yellow-800">Maintenance</h3>
              <p className="text-2xl font-bold text-yellow-600">
                {aircraftData.filter(aircraft => aircraft.status === 'maintenance').length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
