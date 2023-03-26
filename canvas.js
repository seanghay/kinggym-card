import path from 'node:path'
import { createCanvas, loadImage, GlobalFonts } from '@napi-rs/canvas';
import qrcode from 'qrcode';

GlobalFonts.loadFontsFromDir(path.join(process.cwd(), 'fonts'));

export async function createCard({
  link,
  name,
  expiration,
  profileUrl
}) {

  const bg = await loadImage(path.join(process.cwd(), "kinggym.png"))
  const canvas = createCanvas(bg.width, bg.height);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

  ctx.textBaseline = 'top';

  // profile photo
  // ctx.fillStyle = 'white';
  // ctx.fillRect(420, 50, 250, 250);

  if (profileUrl) {
    const profile = await loadImage(profileUrl);
    ctx.drawImage(profile, 420, 50, 250, 250);
  }

  // name
  ctx.fillStyle = '#ff6e6e';
  const rectSize = 80

  ctx.fillRect(0, 350, canvas.width, rectSize);
  ctx.fillStyle = 'white';
  ctx.font = `bold ${Math.round(rectSize * .5)}px Kantumruy Pro, sans-serif`;

  const metrics = ctx.measureText(name);
  ctx.fillText(name, (canvas.width - metrics.width) / 2,
    350 + (rectSize / 2) - (metrics.fontBoundingBoxDescent - metrics.fontBoundingBoxAscent) / 2);

  // expiration
  const rectSize2 = 60
  ctx.fillStyle = '#ffa7a7';
  ctx.fillRect(0, 350 + rectSize, canvas.width, rectSize2);

  ctx.fillStyle = 'white';
  ctx.font = 'bold 32px Kantumruy Pro, sans-serif';

  const metrics2 = ctx.measureText(expiration);

  ctx.fillText(expiration, (canvas.width - metrics2.width) / 2, 350 + rectSize +
    (rectSize2 / 2) - (metrics2.fontBoundingBoxDescent - metrics2.fontBoundingBoxAscent) / 2
  );

  const qrcodeTop = 350 + rectSize + rectSize2;
  const qrcodeSize = 300;
  const qrcodeImage = await loadImage(await qrcode.toBuffer(link, { width: qrcodeSize }));

  ctx.fillStyle = 'white';
  const margin = 0
  ctx.fillRect(margin, qrcodeTop, canvas.width - (margin * 2), canvas.height - qrcodeTop - margin);

  ctx.drawImage(qrcodeImage, (canvas.width - qrcodeSize) / 2,
    qrcodeTop + (canvas.height - qrcodeTop - qrcodeSize) / 2,
    qrcodeSize, qrcodeSize
  );

  return canvas.toBuffer('image/png');
}
