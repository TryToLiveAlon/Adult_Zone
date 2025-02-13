const TelegramBot = require('node-telegram-bot-api');
const config = require('./config');
const cron = require('node-cron');
const { checkExpiredSubscriptions } = require('./mongo');

cron.schedule('0 * * * *', async () => {
    await checkExpiredSubscriptions();
});
// Initialize the bot instance here
const bot = new TelegramBot(config.token, { webHook: true });

bot.setWebHook(config.WEBHOOK_URL, { max_connections: 40 })
    .then(() => {
        console.log('✅ Webhook set successfully');
    })
    .catch((error) => {
        console.error('❌ Failed to set webhook:', error);
    });

module.exports = bot;  // Export the bot instance to be used in other files
