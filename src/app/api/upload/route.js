import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';
import sharp from 'sharp';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get('image');
    const name = formData.get('name');
    const category = formData.get('category');
    const dimensions = formData.get('dimensions');
    const bestRoomSize = formData.get('bestRoomSize');
    const priceRange = formData.get('priceRange') || "Price on Request";
    const description = formData.get('description') || "A gorgeous new addition to our premium luxury lineup.";
    const tagline = formData.get('tagline') || "Premium Collection";
    const colors = formData.get('colors') ? formData.get('colors').split(',') : ["Custom Order"];
    const skipBgRemoval = formData.get('skipBgRemoval') === 'true';

    if (!imageFile || !name) {
      return NextResponse.json({ error: 'Missing image or name' }, { status: 400 });
    }

    // Load API Key
    const configPath = path.join(process.cwd(), 'data', 'adminConfig.json');
    let apiKey = null;
    if (fs.existsSync(configPath)) {
      const configData = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      apiKey = configData.removeBgApiKey;
    }

    // Convert uploaded file to Buffer
    const arrayBuffer = await imageFile.arrayBuffer();
    const imageBuffer = Buffer.from(arrayBuffer);

    let transparentBuffer = imageBuffer;

    if (!skipBgRemoval) {
      if (!apiKey) {
        return NextResponse.json({ error: 'Remove.bg API Key is missing. Please save it in settings.' }, { status: 400 });
      }

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
        console.error("Remove.bg error:", errorText);
        return NextResponse.json({ error: 'Background removal failed. Check your API key.' }, { status: 500 });
      }

      transparentBuffer = Buffer.from(await removeBgResponse.arrayBuffer());
    }

    // Process image with Sharp:
    // 1. Trim away empty transparent space.
    // 2. Fit into a 1000x1000 canvas, centered, retaining aspect ratio.
    const processedBuffer = await sharp(transparentBuffer)
      .trim()
      .resize(1000, 1000, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 } // Transparent background
      })
      .png()
      .toBuffer();

    // Save image to public folder
    const fileName = `${name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now()}.png`;
    const imagePath = path.join(process.cwd(), 'public', 'images', 'products', fileName);
    
    // Ensure dir exists
    const dirPath = path.dirname(imagePath);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    fs.writeFileSync(imagePath, processedBuffer);
    const publicUrl = `/images/products/${fileName}`;

    // Update catalogData.json
    const catalogPath = path.join(process.cwd(), 'data', 'catalogData.json');
    let catalogData = { products: [] };
    if (fs.existsSync(catalogPath)) {
      catalogData = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
    }

    const newProduct = {
      id: `prod-${Date.now()}`,
      category: category,
      name: name,
      tagline: tagline,
      description: description,
      images: {
        isolated: publicUrl,
        lifestyle: publicUrl // Using same image for now since we lack a lifestyle generator
      },
      dimensions: dimensions,
      seatingCapacity: "Varies",
      bestRoomSize: bestRoomSize,
      compatibility: {
        small: "❌ (Check dimensions)",
        medium: "✅ (Recommended)",
        large: "⭐ (Perfect Fit)"
      },
      options: {
        colors: colors.map(c => c.trim()),
        fabric: "Premium Finish"
      },
      priceRange: priceRange
    };

    catalogData.products.push(newProduct);
    fs.writeFileSync(catalogPath, JSON.stringify(catalogData, null, 2));

    return NextResponse.json({ success: true, product: newProduct });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: 'Internal server error during upload.' }, { status: 500 });
  }
}