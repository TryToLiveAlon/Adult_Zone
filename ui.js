const bot = require('./bot');  // Import the already initialized bot instance
const { getUserData } = require('./mongo');

async function sendInfoMessage(chatId) {
    const user = await getUserData(chatId);
    const subscriptionPlanMessage = user.subscription_plan === 'premium'
        ? 'You are currently subscribed to the Premium plan.'
        : 'You are currently subscribed to the Free plan.';

    // Corrected text with proper HTML formatting
    const infoMessage = `𝖨𝖭𝖥𝖮𝖱𝖬𝖠𝖳𝖨𝖮𝖭
    
<blockquote>𝖠𝖻𝗈𝗎𝗍 𝖡𝗈𝗍</blockquote>

» 𝖡𝗈𝗍 𝖭𝖺𝗆𝖾 - <a href="https://t.me/AdultZonelBot">𝖳𝖾𝗋𝖺𝖻𝗈𝗑 𝖵𝗂𝖽𝖾𝗈𝗌 𝖡𝗈𝗍</a>
 » 𝖢𝗋𝖾𝖺𝗍𝗈𝗋 - <a href="https://t.me/DeathSupportBot">𝐃ᴇᴀᴛʜ 𝐒ᴜᴘᴘᴏʀᴛ 𝐁ᴏᴛ</a>
 » 𝖴𝗉𝖽𝖺𝗍𝖾𝗌 - <a href="https://t.me/TryToLiveAlon">𝖡𝗈𝗇𝗀𝗈𝖹𝗈𝗇𝖾</a> 
 
<blockquote>𝖳𝖾𝖼𝗁𝗇𝗂𝖼𝖺𝗅 𝖲𝗉𝖾𝖼𝗂𝖿𝗂𝖼𝖺𝗍𝗂𝗈𝗇𝗌</blockquote>

 » 𝖵𝖾𝗋𝗌𝗂𝗈𝗇 - 𝖵2.2
 » 𝖫𝖺𝗇𝗀𝗎𝖺𝗀𝖾 - <a href="https://www.python.org/download/releases/3.0/">𝖯𝗒𝗍𝗁𝗈𝗇 3</a> 
 » 𝖥𝗋𝖺𝗆𝖾𝖶𝗈𝗋𝗄 - <a href="https://docs.pyrogram.org/">𝖯𝗒𝗋𝗈𝗀𝗋𝖺𝗆</a>
 » 𝖣𝖺𝗍𝖺𝖻𝖺𝗌𝖾 - <a href="https://www.mongodb.com/">𝖬𝗈𝗇𝗀𝗈 𝖣𝖡</a>
 » 𝖧𝗈𝗌𝗍𝖾𝖽 𝖮𝗇 - <a href="https://itsbotdevfather.vercel.app/">𝖵𝖯𝖲</a>

 𝖨𝖿 𝖸𝗈𝗎 𝖠𝗋𝖾 𝖥𝖺𝖼𝗂𝗇𝗀 𝖠𝗇𝗒 𝖤𝗋𝗋𝗈𝗋 𝖯𝗅𝖾𝖺𝗌𝖾 𝖢𝗈𝗇𝗍𝖺𝖼𝗍 𝖶𝗂𝗍𝗁 𝖴𝗌 - <a href="https://t.me/DeathSupportBot">𝖲𝗎𝗉𝗉𝗈𝗋𝗍</a>`;
    bot.sendMessage(chatId, infoMessage, { 
        parse_mode: 'HTML',
        disable_web_page_preview: true
    });
}

// Function to send Info Message
async function PlanDetail(chatId) {
    const user = await getUserData(chatId);
    const dailyLimit = user.subscription_plan === 'premium' ? 30 : 5;
    const filesUsed = user.video_count;
    const filesRemaining = dailyLimit - filesUsed;
    const infoMessage = `
   <blockquote>𝖯𝗅𝖺𝗇 𝖣𝖾𝗍𝖺𝗂𝗅𝗌</blockquote>
𝖴𝗌𝖾𝗋 𝖭𝖺𝗆𝖾 - ${user.username || "No Username"}
𝖴𝗌𝖾𝗋 𝖨𝖣 - ${user.chat_id}
𝖲𝗎𝖻𝗌𝖼𝗋𝗂𝗉𝗍𝗂𝗈𝗇 - ${user.subscription_plan === 'premium' ? 'Premium' : 'Free'}
𝖣𝖺𝗂𝗅𝗒 𝖥𝗂𝗅𝖾𝗌 𝖫𝗂𝗆𝗂𝗍𝗌 - ${dailyLimit} 𝖥𝗂𝗅𝖾𝗌
𝖥𝗂𝗅𝖾𝗌 𝖴𝗌𝖾𝖽 - ${filesUsed}/${dailyLimit}
𝖥𝗂𝗅𝖾𝗌 𝖱𝖾𝗆𝖺𝗂𝗇𝗂𝗇𝗀 - ${filesRemaining} 𝖥𝗂𝗅𝖾𝗌`;
    
    bot.sendMessage(chatId, infoMessage, {
        parse_mode: 'HTML',
       
    });
}

async function SubscriptionInfo(chatId) {
    // Subscription Info message with proper HTML formatting
    const subscriptionMessage = `
𝖯𝗎𝗋𝖼𝗁𝖺𝗌𝖾 𝖮𝗎𝗋 𝖲𝗎𝖻𝗌𝖼𝗋𝗂𝗉𝗍𝗂𝗈𝗇 𝖳𝗈 𝖡𝗈𝗈𝗌𝗍 𝖸𝗈𝗎 𝖣𝖺𝗂𝗅𝗒 𝖫𝗂𝗆𝗂𝗍𝗌.

<blockquote>𝖥𝗋𝖾𝖾 𝖴𝗌𝖾𝗋 𝖡𝖾𝗇𝖾𝖿𝗂𝗍𝗌</blockquote>
» 𝖦𝖾𝗍 𝖣𝖺𝗂𝗅𝗒 5 𝖥𝗂𝗅𝖾𝗌 𝖣𝖺𝗂𝗅𝗒
» 𝖬𝖺𝗑𝗂𝗆𝗎𝗆 𝖵𝗂𝗽𝖾 
» 𝖭𝗈 𝖯𝗋𝖾𝗆𝗂𝗎𝗆 𝖢𝗈𝗇𝗍𝖾𝗇𝗍

<blockquote>𝖯𝗋𝖾𝗆𝗂𝗎𝗆 𝖴𝗌𝖾𝗋 𝖡𝖾𝗇𝖾𝖿𝗂𝗍𝗌</blockquote>
» 𝖦𝖾𝗍 𝖣𝖺𝗂𝗅𝗒 30 𝖥𝗂𝗅𝖾𝗌 𝖣𝖺𝗂𝗅𝗒
» 𝖬𝖺𝗑𝗂𝗆𝗎𝗆 𝖵𝗂𝗽𝖾𝗈 𝖫𝖾𝗇𝗖𝗁 𝖴𝗇𝗅𝗂𝗆𝗂𝗍𝖾𝖽
» 𝖯𝗋𝖾𝗆𝗂𝗎𝗆 𝖢𝗈𝗇𝗍𝖾𝗇𝗍

<blockquote>𝖲𝗎𝖻𝗌𝖼𝗋𝗂𝗉𝗍𝗂𝗈𝗇 𝖯𝗋𝗂𝖼𝖾</blockquote>  
1 Month - 50₹
2 Months - 90₹
3 Months - 130₹

𝖢𝗈𝗇𝗍𝖺𝖼𝗍 𝖮𝗐𝗇𝖾𝗋 𝖥𝗈𝗋 𝖬𝗈𝗋𝖾 𝖨𝗇𝖿𝗈𝗋𝗆𝖺𝗍𝗂𝗈𝗇 𝖠𝖻𝗈𝗎𝗍 𝖯𝖺𝗒𝗆𝖾𝗇𝗍.
    `;

    // Inline keyboard button to contact the owner
    const inlineKeyboard = {
        inline_keyboard: [
            [{
                text: "Contact",
                url: "https://t.me/DeathSupportBot"  // Replace with your actual Telegram support link
            }]
        ]
    };

    // Send the formatted message with inline button
    bot.sendMessage(chatId, subscriptionMessage, {
        parse_mode: 'HTML',
        reply_markup: inlineKeyboard
    });
}


module.exports = { PlanDetail,sendInfoMessage,SubscriptionInfo };
