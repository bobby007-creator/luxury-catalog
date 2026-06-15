import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const name = formData.get('name');
    const tagline = formData.get('tagline');
    const about = formData.get('about');
    const phone = formData.get('phone');
    const website = formData.get('website');
    const address = formData.get('address');
    const qualityCommitment = formData.get('qualityCommitment');
    const coverTextColor = formData.get('coverTextColor');
    const logoPosition = formData.get('logoPosition');
    const textPosition = formData.get('textPosition');
    const hideLogo = formData.get('hideLogo') === 'true';
    
    const coverImage = formData.get('coverImage');
    const logoImage = formData.get('logoImage');

    // 1. Update text in catalogData.json
    const catalogPath = path.join(process.cwd(), 'data', 'catalogData.json');
    let catalogData = {};
    if (fs.existsSync(catalogPath)) {
      catalogData = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
    }

    if (!catalogData.brand) catalogData.brand = {};
    if (!catalogData.brand.contact) catalogData.brand.contact = {};
    if (!catalogData.brand.layout) catalogData.brand.layout = {};
    
    if (name) catalogData.brand.name = name;
    if (tagline) catalogData.brand.tagline = tagline;
    if (about) catalogData.brand.about = about;
    if (phone) catalogData.brand.contact.phone = phone;
    if (website) catalogData.brand.contact.website = website;
    if (address) catalogData.brand.contact.address = address;
    
    if (qualityCommitment) {
      try {
        catalogData.brand.qualityCommitment = JSON.parse(qualityCommitment);
      } catch (e) {
        console.error("Failed to parse qualityCommitment", e);
      }
    }
    
    if (coverTextColor) catalogData.brand.coverTextColor = coverTextColor;
    
    catalogData.brand.hideLogo = hideLogo;
    
    if (logoPosition) {
      try {
        catalogData.brand.layout.logoPosition = JSON.parse(logoPosition);
      } catch (e) {}
    }
    
    if (textPosition) {
      try {
        catalogData.brand.layout.textPosition = JSON.parse(textPosition);
      } catch (e) {}
    }

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
