const express = require('express');
const bot = require('../bot');

const app = express();
app.use(express.json());

// Webhook route
app.post('/api/webhook', (req, res) => {
    bot.processUpdate(req.body);
    res.sendStatus(200);
});

// Default route to keep the bot awake
app.get('/', (req, res) => {
    res.send("🤖 Telegram Bot is Live!");
});

module.exports = app;
