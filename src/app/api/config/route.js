import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

const configPath = path.join(process.cwd(), 'data', 'adminConfig.json');

export async function GET() {
  try {
    if (fs.existsSync(configPath)) {
      const data = fs.readFileSync(configPath, 'utf8');
      return NextResponse.json(JSON.parse(data));
    }
    return NextResponse.json({});
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read config' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    
    // Ensure data directory exists
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    let configData = {};
    if (fs.existsSync(configPath)) {
      configData = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    }

    const updatedConfig = { ...configData, ...body };
    fs.writeFileSync(configPath, JSON.stringify(updatedConfig, null, 2));

    return NextResponse.json({ success: true, config: updatedConfig });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save config' }, { status: 500 });
  }
}