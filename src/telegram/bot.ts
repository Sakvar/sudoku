import TelegramBot from 'node-telegram-bot-api';

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
  throw new Error('TELEGRAM_BOT_TOKEN is not set');
}

const bot = new TelegramBot(token, { polling: true });
const WEBAPP_URL = 'https://Sakvar.github.io/sudoku/';

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, 'Welcome to Sudoku!', {
    reply_markup: {
      inline_keyboard: [[
        { text: 'Play Sudoku', web_app: { url: WEBAPP_URL } }
      ]]
    }
  });
}); 