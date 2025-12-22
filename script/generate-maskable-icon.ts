import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const inputSvg = join(__dirname, '../public/icons/maskable-icon.svg');
const outputPng = join(__dirname, '../public/icons/maskable-icon.png');

async function generateMaskableIcon() {
    console.log('Generating maskable icon...');

    try {
        await sharp(inputSvg)
            .resize(512, 512)
            .png()
            .toFile(outputPng);

        console.log('✓ Generated maskable-icon.png (512x512)');
    } catch (error) {
        console.error('✗ Failed to generate maskable icon:', error);
        process.exit(1);
    }

    console.log('Maskable icon generation complete!');
}

generateMaskableIcon().catch(console.error);
