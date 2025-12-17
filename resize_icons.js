import { Jimp } from 'jimp';

async function resizeIcons() {
  const sizes = [16, 32, 48, 128];
  const inputFile = 'public/logo/goodBoardIcon.png';

  try {
    const image = await Jimp.read(inputFile);

    for (const size of sizes) {
      const resized = image.clone().resize({ w: size, h: size });
      const outputFile = `public/logo/icon${size}.png`;
      await resized.write(outputFile);
      console.log(`Generated ${outputFile}`);
    }
    console.log('All icons generated successfully!');
  } catch (error) {
    console.error('Error generating icons:', error);
  }
}

resizeIcons();