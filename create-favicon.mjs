import { createCanvas, loadImage } from 'canvas';
import { writeFileSync } from 'fs';

async function createFavicon() {
  try {
    // Create a 512x512 canvas for high quality
    const canvas = createCanvas(512, 512);
    const ctx = canvas.getContext('2d');
    
    // Fill with yellow background
    ctx.fillStyle = '#fbc560';
    ctx.fillRect(0, 0, 512, 512);
    
    // Load the logo image
    const img = await loadImage('https://framerusercontent.com/images/bYdEiYKnlTCyPyWpSa1NHSZyyrE.png?scale-down-to=512&width=794&height=644');
    
    // Calculate size to fit logo in favicon with minimal padding (really big logo)
    const padding = 8;
    const size = 512 - (padding * 2);
    
    // Draw the logo centered with some padding
    ctx.drawImage(img, padding, padding, size, size);
    
    // Save as PNG
    const buffer = canvas.toBuffer('image/png');
    writeFileSync('./client/public/favicon.png', buffer);
    
    // Also create smaller sizes
    const canvas16 = createCanvas(16, 16);
    const ctx16 = canvas16.getContext('2d');
    ctx16.drawImage(canvas, 0, 0, 512, 512, 0, 0, 16, 16);
    writeFileSync('./client/public/favicon-16.png', canvas16.toBuffer('image/png'));
    
    const canvas32 = createCanvas(32, 32);
    const ctx32 = canvas32.getContext('2d');
    ctx32.drawImage(canvas, 0, 0, 512, 512, 0, 0, 32, 32);
    writeFileSync('./client/public/favicon-32.png', canvas32.toBuffer('image/png'));
    
    console.log('Favicons created successfully!');
  } catch (error) {
    console.error('Error creating favicon:', error);
  }
}

createFavicon();