import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

interface Aircraft {
  tailNumber: string;
  model: string;
  status: 'available' | 'aog' | 'maintenance';
  location: {
    latitude: number;
    longitude: number;
  };
}

export async function GET(): Promise<NextResponse<Aircraft[]>> {
  try {
    const filePath = path.join(process.cwd(), 'data', 'aircraft.json');
    const fileContents = await fs.readFile(filePath, 'utf8');
    const aircraftData: Aircraft[] = JSON.parse(fileContents);
    
    return NextResponse.json(aircraftData);
  } catch (error) {
    console.error('Error reading aircraft data:', error);
    return NextResponse.json([], { status: 500 });
  }
} 