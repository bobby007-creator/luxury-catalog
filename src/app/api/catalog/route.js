import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

export async function GET() {
  const catalogPath = path.join(process.cwd(), 'data', 'catalogData.json');
  if (fs.existsSync(catalogPath)) {
    const data = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
    return NextResponse.json(data);
  }
  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}
