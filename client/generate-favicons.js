import fs from 'fs';
import path from 'path';
import svg2img from 'svg2img';
import sharp from 'sharp';

const PUBLIC_DIR = path.resolve('./public');
const SVG_PATH = path.join(PUBLIC_DIR, 'favicon.svg');
const SVG_CONTENT = fs.readFileSync(SVG_PATH);

// Ensure directories exist
if (!fs.existsSync(PUBLIC_DIR)) {
  fs.mkdirSync(PUBLIC_DIR, { recursive: true });
}

// Generate favicon.ico (multiple sizes in one ICO file)
svg2img(SVG_CONTENT, { width: 256, height: 256 }, async (err, buffer) => {
  if (err) {
    console.error('Error converting SVG to PNG for ICO:', err);
    return;
  }

  try {
    // Resize and save favicons of different sizes
    await sharp(buffer)
      .resize(16, 16)
      .toFile(path.join(PUBLIC_DIR, 'favicon-16x16.png'));

    await sharp(buffer)
      .resize(32, 32)
      .toFile(path.join(PUBLIC_DIR, 'favicon-32x32.png'));
      
    await sharp(buffer)
      .resize(180, 180)
      .toFile(path.join(PUBLIC_DIR, 'apple-touch-icon.png'));
      
    // For favicon.ico we'll use the 32x32 version
    await sharp(buffer)
      .resize(32, 32)
      .toFile(path.join(PUBLIC_DIR, 'favicon.ico'));

    console.log('All favicons generated successfully!');
  } catch (error) {
    console.error('Error generating favicons:', error);
  }
}); 