const bot = require('./bot');
const config = require('./config');
const { connectDB } = require('./mongo');
const {  PlanDetail,sendInfoMessage,SubscriptionInfo } = require('./ui');
const { sendRandomVideo } = require('./videosender');
require('./admin')
const {connectVDB} = require('./videoSchema')

// Connect to the database
connectDB();
connectVDB();

// Handle /start command
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;

    // Create random links for disclaimer and terms
    const disclaimerLink = "https://telegra.ph/DISCLAIMER-02-09-38";  // Random disclaimer link
    const termsLink = "https://telegra.ph/TERMS-AND-CONDITIONS-02-09-5";  // Random terms link

    const startText = `
    <blockquote>𝖳𝗁𝗂𝗌 𝖡𝗈𝗍 𝖢𝗈𝗇𝗍𝖺𝗂𝗇𝗌 18+ 𝖢𝗈𝗇𝗍𝖾𝗇𝗍 𝖲𝗈 𝖪𝗂𝗇𝖽𝗅𝗒 𝖠𝖼𝖼𝖾𝗌𝗌 𝖨𝗍 𝖶𝗂𝗍𝗁 𝖸𝗈𝗎𝗋 𝖮𝗐𝗇 𝖱𝗂𝗌𝗄. 𝖳𝗁𝖾 𝖬𝖺𝗍𝖾𝗋𝗂𝖺𝗅 𝖬𝖺𝗒 𝖨𝗇𝖼𝗅𝗎𝖽𝖾 𝖤𝗑𝗉𝗅𝗂𝖼𝗂𝗍 𝖮𝗋 𝖦𝗋𝖺𝗉𝗁𝗂𝖼 𝖢𝗈𝗇𝗍𝖺𝖼𝗍 𝖳𝗁𝖺𝗍 𝖨𝗌 𝖴𝗇𝗌𝗎𝗂𝗍𝖺𝖻𝗅𝖾 𝖥𝗈𝗋 𝖬𝗂𝗇𝗈𝗋𝗌. 𝖲𝗈 𝖢𝗁𝗂𝗅𝖽𝗋𝖾𝗇𝗌 𝖯𝗅𝖾𝖺𝗌𝖾 𝖲𝗍𝖺𝗒 𝖠𝗐𝖺𝗒.
    </blockquote>
    
𝖯𝗅𝖾𝖺𝗌𝖾 𝖢𝗁𝖾𝖼𝗄 𝖮𝗎𝗋 <a href="${disclaimerLink}">𝖣𝗂𝗌𝖼𝗅𝖺𝗂𝗆𝖾𝗋</a> 𝖠𝗇𝖽 <a href="${termsLink}">𝖳𝖾𝗋𝗆𝗌</a> 𝖡𝖾𝖿𝗈𝗋𝖾 𝖴𝗌𝗂𝗇𝗀 𝖳𝗁𝗂𝗌 𝖡𝗈𝗍.
    `;

    // URL for the image you want to send
    const imageUrl = 'https://ibb.co/PZCgTQN2';  // Replace with your actual image URL

    // Send the image with the HTML caption
    bot.sendPhoto(chatId, imageUrl, { caption: startText, parse_mode: 'HTML' })
        .catch(error => {
            console.error('Error sending image:', error);
            bot.sendMessage(chatId, 'Failed to send image.');
        });
});
bot.onText(/\/keyboard/, (msg) => {
    const chatId = msg.chat.id;

    // Reply Keyboard (Typing Area Buttons)
    const keyboard = {
        keyboard: [
            ["Get Video"],
            ["My Plan", "Subscription"],
            ["About"]
        ],
        resize_keyboard: true,  // Makes keyboard smaller to fit screen
        one_time_keyboard: false  // Keeps keyboard open permanently
    };

    // Send Reply Keyboard
    bot.sendMessage(chatId, "Use the keyboard below:", {
        reply_markup: keyboard
    });


// Command to get a random video
bot.onText(/\/getvideo/, async (msg) => {
    const chatId = msg.chat.id;
    await sendRandomVideo(chatId);
});
});

bot.on("message", (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (text === "Get Video") {
      sendRandomVideo(chatId);
    } else if (text === "My Plan") {
      PlanDetail(chatId);
    } else if (text === "Subscription") {
      SubscriptionInfo(chatId);
    } else if (text === "About") {
      sendInfoMessage(chatId);
    }
});
// Command to show bot information
bot.onText(/\/info/, async (msg) => {
    const chatId = msg.chat.id;
    await sendInfoMessage(chatId);
});

// Command to subscribe (upgrade to premium)
bot.onText(/\/subscribe/, async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text.toLowerCase();

    if (text === "/subscribe premium") {
        await upgradeToPremium(chatId);
    } else if (text === "/subscribe free") {
        await downgradeToFree(chatId);
    }
});
