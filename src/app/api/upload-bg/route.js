import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get('image');

    if (!imageFile) {
      return NextResponse.json({ error: 'No image uploaded' }, { status: 400 });
    }

    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const fileName = 'bg_' + Date.now() + '.jpg';
    const imagePath = path.join(process.cwd(), 'public', 'images', 'brand', fileName);
    
    const dirPath = path.dirname(imagePath);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    fs.writeFileSync(imagePath, buffer);
    const publicUrl = '/images/brand/' + fileName;

    return NextResponse.json({ success: true, url: publicUrl });

  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
