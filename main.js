import 'dotenv/config.js';
import { Telegraf } from 'telegraf';
import { message } from 'telegraf/filters'
import { createCard } from './canvas.js'
import sanitize from "sanitize-filename";

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

bot.start((ctx) => ctx.reply("Welcome to the membership bot!"))
bot.on(message('sticker'), (ctx) => ctx.reply('✋'));
bot.on(message('text'), async (ctx) => {
  ctx.sendChatAction('upload_photo');
  let profileUrl;
  const profile = await ctx.telegram.getUserProfilePhotos(ctx.message.from.id);
  if (profile.photos.length > 0) {
    const items = profile.photos[profile.photos.length - 1];
    if (items.length > 0) {
      const file = items[0];
      const url = await ctx.telegram.getFileLink(file.file_id);
      if (url) {
        profileUrl = url.href;
      }
    }
  }

  let [name, expiration] = ctx.message.text.split(',');

  if (name) {
    name = name.trim().toUpperCase();
  }

  if (expiration) {
    expiration = `EXPIRE: ` + expiration.trim().toUpperCase();
  }

  const buffer = await createCard({
    name: name || "EMPTY",
    expiration: expiration || "EMPTY",
    profileUrl,
    link: "https://t.me/KingGymMembersBot?start=" + encodeURIComponent(JSON.stringify({ name, expiration }))
  });

  await ctx.replyWithPhoto({ source: buffer }, {
    disable_notification: true,
  });
  await ctx.replyWithDocument({
    source: buffer,
    filename: sanitize(`${name}-${expiration}`) + '.png'
  }, {
    disable_notification: true,
  });



});


bot.launch();

// graceful shutdown
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

