import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, '..', 'public');
const srcLogo = 'C:\\Users\\Maison\\Desktop\\Logo Nexus.png';

async function convert() {
  console.log('Converting logo...');

  // Full logo WebP (for header, footer, og-image)
  await sharp(srcLogo)
    .resize(400, null, { withoutEnlargement: true })
    .webp({ quality: 90 })
    .toFile(path.join(publicDir, 'logo.webp'));
  console.log('✓ logo.webp (400px)');

  // Small logo for header/sidebar (48px)
  await sharp(srcLogo)
    .resize(48, 48, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .webp({ quality: 90 })
    .toFile(path.join(publicDir, 'logo-48.webp'));
  console.log('✓ logo-48.webp');

  // Medium logo (96px)
  await sharp(srcLogo)
    .resize(96, 96, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .webp({ quality: 90 })
    .toFile(path.join(publicDir, 'logo-96.webp'));
  console.log('✓ logo-96.webp');

  // Large for OG image (512px)
  await sharp(srcLogo)
    .resize(512, null, { withoutEnlargement: true })
    .png()
    .toFile(path.join(publicDir, 'logo.png'));
  console.log('✓ logo.png (512px)');

  // OG image (1200x630)
  await sharp(srcLogo)
    .resize(400, 400, { fit: 'contain', background: { r: 23, g: 37, b: 84, alpha: 1 } })
    .extend({
      top: 115,
      bottom: 115,
      left: 400,
      right: 400,
      background: { r: 23, g: 37, b: 84, alpha: 1 }
    })
    .png()
    .toFile(path.join(publicDir, 'og-image.png'));
  console.log('✓ og-image.png (1200x630)');

  // Favicon ICO (32x32 PNG — browsers accept png as favicon)
  await sharp(srcLogo)
    .resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(publicDir, 'favicon.png'));
  console.log('✓ favicon.png (32x32)');

  // Apple touch icon (180x180)
  await sharp(srcLogo)
    .resize(180, 180, { fit: 'contain', background: { r: 23, g: 37, b: 84, alpha: 1 } })
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('✓ apple-touch-icon.png (180x180)');

  // Favicon 16x16
  await sharp(srcLogo)
    .resize(16, 16, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(publicDir, 'favicon-16x16.png'));
  console.log('✓ favicon-16x16.png');

  // Favicon 32x32
  await sharp(srcLogo)
    .resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(publicDir, 'favicon-32x32.png'));
  console.log('✓ favicon-32x32.png');

  console.log('\\nAll logo conversions done!');
}

convert().catch(console.error);
