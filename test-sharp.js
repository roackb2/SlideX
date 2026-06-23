const sharp = require('sharp');

async function check() {
  const metadata = await sharp('public/logo.png').metadata();
  console.log('Metadata:', metadata);
  
  // Create a negated version
  await sharp('public/logo.png')
    .negate({ alpha: false })
    .toFile('public/logo-dark.png');
    
  // Also create a version where all non-transparent pixels are black
  await sharp('public/logo.png')
    .composite([{
      input: Buffer.from([0, 0, 0, 255]),
      raw: { width: 1, height: 1, channels: 4 },
      tile: true,
      blend: 'in'
    }])
    .toFile('public/logo-black.png');

  console.log('Created logo-dark.png and logo-black.png');
}

check().catch(console.error);
