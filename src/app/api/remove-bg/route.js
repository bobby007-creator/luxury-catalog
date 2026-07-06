import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get('image');

    if (!imageFile) {
      return NextResponse.json({ error: 'Missing image' }, { status: 400 });
    }

    // Load API Key
    const configPath = path.join(process.cwd(), 'data', 'adminConfig.json');
    let apiKey = null;
    if (fs.existsSync(configPath)) {
      const configData = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      apiKey = configData.removeBgApiKey;
    }

    if (!apiKey) {
      return NextResponse.json({ error: 'Remove.bg API Key is missing. Please save it in settings.' }, { status: 400 });
    }

    // Convert uploaded file to Buffer
    const arrayBuffer = await imageFile.arrayBuffer();
    const imageBuffer = Buffer.from(arrayBuffer);

    // Call Remove.bg API
    const removeBgFormData = new FormData();
    removeBgFormData.append('size', 'auto');
    removeBgFormData.append('image_file', new Blob([imageBuffer], { type: imageFile.type }));

    const removeBgResponse = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: {
        'X-Api-Key': apiKey,
      },
      body: removeBgFormData,
    });

    if (!removeBgResponse.ok) {
      const errorText = await removeBgResponse.text();
      console.error('Remove.bg Error:', errorText);
      return NextResponse.json({ error: 'Failed to remove background from image via API.' }, { status: 500 });
    }

    const processedArrayBuffer = await removeBgResponse.arrayBuffer();
    const processedBuffer = Buffer.from(processedArrayBuffer);

    // Ensure the custom directory exists
    const customDir = path.join(process.cwd(), 'public', 'images', 'custom');
    if (!fs.existsSync(customDir)) {
      fs.mkdirSync(customDir, { recursive: true });
    }

    // Generate unique filename
    const filename = `custom_${Date.now()}.png`;
    const filepath = path.join(customDir, filename);

    // Save the processed image
    fs.writeFileSync(filepath, processedBuffer);

    const imageUrl = `/images/custom/${filename}`;

    return NextResponse.json({ success: true, imageUrl });

  } catch (error) {
    console.error('Remove BG Error:', error);
    return NextResponse.json({ error: 'Failed to process image' }, { status: 500 });
  }
}
