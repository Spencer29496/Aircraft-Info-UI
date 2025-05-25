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

export async function PUT(request: Request): Promise<NextResponse> {
  try {
    const { tailNumber, status } = await request.json();
    
    if (!tailNumber || !status) {
      return NextResponse.json({ error: 'tailNumber and status are required' }, { status: 400 });
    }
    
    if (!['available', 'aog', 'maintenance'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status. Must be available, aog, or maintenance' }, { status: 400 });
    }
    
    const filePath = path.join(process.cwd(), 'data', 'aircraft.json');
    const fileContents = await fs.readFile(filePath, 'utf8');
    const aircraftData: Aircraft[] = JSON.parse(fileContents);
    
    const aircraftIndex = aircraftData.findIndex(aircraft => aircraft.tailNumber === tailNumber);
    
    if (aircraftIndex === -1) {
      return NextResponse.json({ error: 'Aircraft not found' }, { status: 404 });
    }
    
    aircraftData[aircraftIndex].status = status;
    
    await fs.writeFile(filePath, JSON.stringify(aircraftData, null, 2));
    
    return NextResponse.json({ 
      message: 'Aircraft status updated successfully',
      aircraft: aircraftData[aircraftIndex]
    });
  } catch (error) {
    console.error('Error updating aircraft status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 