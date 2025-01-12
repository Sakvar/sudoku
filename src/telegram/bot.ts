import { Telegraf } from 'telegraf';

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
  throw new Error('TELEGRAM_BOT_TOKEN is not set');
}

const bot = new Telegraf(token);
const WEBAPP_URL = 'https://Sakvar.github.io/sudoku/';

bot.start((ctx) => {
  ctx.reply('Welcome to Sudoku!', {
    reply_markup: {
      inline_keyboard: [[
        { text: 'Play Sudoku', web_app: { url: WEBAPP_URL } }
      ]]
    }
  });
});

bot.launch().then(() => {
  console.log('Bot is running');
});

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM')); 