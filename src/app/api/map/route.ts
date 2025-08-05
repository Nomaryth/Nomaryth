import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const mapDataPath = path.join(process.cwd(), 'src', 'lib', 'map-data.json');

export async function GET() {
  try {
    const fileContent = await fs.readFile(mapDataPath, 'utf-8');
    const data = JSON.parse(fileContent);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to read map data:', error);
    return NextResponse.json({ error: 'Failed to read map data' }, { status: 500 });
  }
}
