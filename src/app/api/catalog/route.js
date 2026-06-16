import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
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

export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, name, category, tagline, description, priceRange, dimensions, colors } = body;
    
    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const catalogPath = path.join(process.cwd(), 'data', 'catalogData.json');
    if (fs.existsSync(catalogPath)) {
      let data = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
      
      const productIndex = data.products.findIndex(p => p.id === id);
      if (productIndex !== -1) {
        // Update fields
        if (name) data.products[productIndex].name = name;
        if (category) data.products[productIndex].category = category;
        if (tagline !== undefined) data.products[productIndex].tagline = tagline;
        if (description !== undefined) data.products[productIndex].description = description;
        if (priceRange !== undefined) data.products[productIndex].priceRange = priceRange;
        if (dimensions !== undefined) data.products[productIndex].dimensions = dimensions;
        
        if (colors && Array.isArray(colors)) {
          if (!data.products[productIndex].options) data.products[productIndex].options = {};
          data.products[productIndex].options.colors = colors;
        }

        fs.writeFileSync(catalogPath, JSON.stringify(data, null, 2));
        return NextResponse.json({ success: true, product: data.products[productIndex] });
      } else {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      }
    }
    
    return NextResponse.json({ error: 'Database not found' }, { status: 500 });
  } catch (error) {
    console.error("Update error:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
