import sharp from 'sharp';

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="115" fill="#f97066"/>
  <path d="M256,370 C256,370 100,278 100,183 C100,128 145,96 190,96 C216,96 240,110 256,136 C272,110 296,96 322,96 C367,96 412,128 412,183 C412,278 256,370 256,370Z" fill="white"/>
</svg>`;

const buf = Buffer.from(svg);

await sharp(buf).resize(512, 512).png().toFile('public/icon-512.png');
await sharp(buf).resize(192, 192).png().toFile('public/icon-192.png');
await sharp(buf).resize(180, 180).png().toFile('public/apple-touch-icon.png');

console.log('Icons generated.');
