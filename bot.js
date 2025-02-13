const TelegramBot = require('node-telegram-bot-api');
const config = require('./config');
const cron = require('node-cron');
const { checkExpiredSubscriptions } = require('./mongo');

cron.schedule('0 * * * *', async () => {
    await checkExpiredSubscriptions();
});
// Initialize the bot instance here
const bot = new TelegramBot(config.token, { webHook: true });

const WEBHOOK_URL = `https://adult-zone-tau.vercel.app/api/webhook`; // Replace with your actual Vercel URL
bot.setWebHook(WEBHOOK_URL);

module.exports = bot;  // Export the bot instance to be used in other files
