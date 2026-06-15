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

export async function DELETE(request) {
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  
  if (!id) {
    return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
  }

  const catalogPath = path.join(process.cwd(), 'data', 'catalogData.json');
  if (fs.existsSync(catalogPath)) {
    let data = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
    
    // Filter out the product
    const originalLength = data.products.length;
    data.products = data.products.filter(p => p.id !== id);
    
    if (data.products.length < originalLength) {
      fs.writeFileSync(catalogPath, JSON.stringify(data, null, 2));
      return NextResponse.json({ success: true, message: 'Product deleted' });
    } else {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
  }
  
  return NextResponse.json({ error: 'Database not found' }, { status: 500 });
}
