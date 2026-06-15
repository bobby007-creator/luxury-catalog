import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const name = formData.get('name');
    const tagline = formData.get('tagline');
    const about = formData.get('about');
    
    const coverImage = formData.get('coverImage');
    const logoImage = formData.get('logoImage');

    // 1. Update text in catalogData.json
    const catalogPath = path.join(process.cwd(), 'data', 'catalogData.json');
    let catalogData = {};
    if (fs.existsSync(catalogPath)) {
      catalogData = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
    }

    if (!catalogData.brand) catalogData.brand = {};
    
    if (name) catalogData.brand.name = name;
    if (tagline) catalogData.brand.tagline = tagline;
    if (about) catalogData.brand.about = about;

    fs.writeFileSync(catalogPath, JSON.stringify(catalogData, null, 2));

    // 2. Save Images to public folder if provided
    if (coverImage && coverImage.size > 0) {
      const coverBuffer = Buffer.from(await coverImage.arrayBuffer());
      const coverPath = path.join(process.cwd(), 'public', 'images', 'cover_image.png');
      fs.writeFileSync(coverPath, coverBuffer);
    }

    if (logoImage && logoImage.size > 0) {
      const logoBuffer = Buffer.from(await logoImage.arrayBuffer());
      const logoPath = path.join(process.cwd(), 'public', 'images', 'logo.png');
      fs.writeFileSync(logoPath, logoBuffer);
    }

    return NextResponse.json({ success: true, brand: catalogData.brand });
  } catch (error) {
    console.error("Branding upload error:", error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
