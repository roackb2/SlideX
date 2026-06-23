const sharp = require('sharp');

async function check() {
  // Create a version where all non-transparent pixels are white
  await sharp('public/logo.png')
    .composite([{
      input: Buffer.from([255, 255, 255, 255]),
      raw: { width: 1, height: 1, channels: 4 },
      tile: true,
      blend: 'in'
    }])
    .toFile('public/logo-white.png');

  console.log('Created logo-white.png');
}

check().catch(console.error);
