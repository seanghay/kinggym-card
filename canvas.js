import fs from 'node:fs/promises'
import path from 'node:path'
import { createCanvas, loadImage, GlobalFonts } from '@napi-rs/canvas';
import qrcode from 'qrcode';

export async function createCard({ name, expiration, profileUrl }) {

  GlobalFonts.loadFontsFromDir(path.join(process.cwd(), 'fonts'));
  const bg = await loadImage(path.join(process.cwd(), "kinggym.png"))
  const canvas = createCanvas(bg.width, bg.height);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

  ctx.textBaseline = 'top';

  // profile photo
  ctx.fillStyle = 'white';
  ctx.fillRect(420, 50, 250, 250);

  if (profileUrl) {
    const profile = await loadImage(profileUrl);
    ctx.drawImage(profile, 420, 50, 250, 250);
  }

  // name
  ctx.fillStyle = '#ff6e6e';
  ctx.fillRect(0, 350, canvas.width, 60);
  ctx.fillStyle = 'white';
  ctx.font = 'bold 44px sans-serif';

  const textWidth = ctx.measureText(name).width;
  ctx.fillText(name, (canvas.width - textWidth) / 2, 350 + 15);

  // expiration
  ctx.fillStyle = '#ffa7a7';
  ctx.fillRect(0, 350 + 60, canvas.width, 60);

  ctx.fillStyle = 'white';
  ctx.font = 'bold 32px sans-serif';

  const textWidthExpiration = ctx.measureText(expiration).width;
  ctx.fillText(expiration, (canvas.width - textWidthExpiration) / 2, 350 + 60 + 20);

  const qrcodeSize = 300;
  const qrcodeImage = await loadImage(await qrcode.toBuffer(name, { width: qrcodeSize }));

  ctx.fillStyle = 'white'
  ctx.fillRect((canvas.width - qrcodeSize) / 2, 550, qrcodeSize, qrcodeSize);
  ctx.drawImage(qrcodeImage, (canvas.width - qrcodeSize) / 2, 550, qrcodeSize, qrcodeSize);

  return canvas.toBuffer('image/png');
}


// await fs.writeFile("image.png", await createCard())