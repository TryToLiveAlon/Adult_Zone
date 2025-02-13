const express = require('express');
const bot = require('../bot');

const app = express();
app.use(express.json());

// Webhook route
app.post('/api/webhook', (req, res) => {
    try {
        bot.processUpdate(req.body); // Process the update from Telegram
        res.status(200).send('OK');   // Send HTTP 200 OK response
    } catch (error) {
        console.error('Error processing webhook:', error);
        res.status(500).send('Internal Server Error');  // Return HTTP 500 if there's an error
    }
});

// Default route to keep the bot awake
app.get('/', (req, res) => {
    res.send("🤖 Telegram Bot is Live!");
});

module.exports = app;
