const bot = require('./bot');
const config = require('./config');
const { updateUserSubscription,getUserCount, getDatabaseStats,broadcastMessage} = require('./mongo');
const { addVideoToDB } = require('./videoSchema');

// Store pending admin actions
const adminState = {};

// Generate a random string for video ID
function generateRandomString(length = 8) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

// Check if the user is an admin
function isAdmin(chatId) {
    return Number(chatId) === Number(config.adminID);
}

// Step 1: Ask the admin to choose Free or Premium
bot.onText(/\/add/, (msg) => {
    const chatId = msg.chat.id;

    if (!isAdmin(chatId)) {
        bot.sendMessage(chatId, "❌ 𝘠𝘰𝘶 𝘢𝘳𝘦 𝘯𝘰𝘵 𝘢𝘶𝘵𝘩𝘰𝘳𝘪𝘴𝘦𝘥 𝘵𝘰 𝘶𝘴𝘦 𝘵𝘩𝘪𝘴 𝘤𝘰𝘮𝘮𝘢𝘯𝘥.");
        return;
    }

    // Send options for Free or Premium
    bot.sendMessage(chatId, "𝘴𝘦𝘭𝘦𝘤𝘵 𝘤𝘢𝘵𝘦𝘨𝘰𝘳𝘺 𝘧𝘰𝘳 𝘵𝘩𝘦 𝘷𝘪𝘥𝘦𝘰.", {
        reply_markup: {
            keyboard: [["Free"], ["Premium"]],
            one_time_keyboard: true,
            resize_keyboard: true
        }
    });

    adminState[chatId] = { step: "awaiting_category" };
});

// Step 2: Handle Free or Premium selection
bot.on("message", async (msg) => {
    const chatId = msg.chat.id;

    if (!adminState[chatId] || adminState[chatId].step !== "awaiting_category") return;
    
    const text = msg.text.toLowerCase();

    if (text === "free" || text === "premium") {
        adminState[chatId] = {
            step: "awaiting_video",
            category: text
        };

        bot.sendMessage(chatId, `✅ You selected *${text.toUpperCase()}*. Now send a video file.`, { parse_mode: "Markdown" });
    }
});

// Step 3: Handle video upload
bot.on("video", async (msg) => {
    const chatId = msg.chat.id;

    if (!adminState[chatId] || adminState[chatId].step !== "awaiting_video") return;

    const category = adminState[chatId].category;
    const videoFileId = msg.video.file_id;
    const videoTitle = generateRandomString();

    // Determine the correct channel to forward the video
    const targetChannel = category === "premium" ? config.premiumChannelID : config.freeChannelID;

    // Forward the video to the target channel
    bot.forwardMessage(targetChannel, chatId, msg.message_id)
        .then(async (sentMsg) => {
            const forwardedFileId = sentMsg.video.file_id; // Get the forwarded video file_id

            // Store video details in the database
            await addVideoToDB(forwardedFileId, videoTitle, category);

            bot.sendMessage(chatId, `✅ Video has been added to the ${category.toUpperCase()} database with ID: *${videoTitle}*`, { parse_mode: "Markdown" });

            // Clear admin state
            delete adminState[chatId];
        })
        .catch((error) => {
            console.error("Error forwarding video:", error);
            bot.sendMessage(chatId, "❌ Failed to add the video. Please try again.");
        });
});

function isAdmin(chatId) {
    return Number(chatId) === Number(config.adminID);
}

// Command: /adduser <months> <user_id>
bot.onText(/\/aduser (\d+) (\d+)/, async (msg, match) => {
    const chatId = msg.chat.id;

    if (!isAdmin(chatId)) {
        bot.sendMessage(chatId, "❌ 𝘠𝘰𝘶 𝘢𝘳𝘦 𝘯𝘰𝘵 𝘢𝘶𝘵𝘩𝘰𝘳𝘪𝘻𝘦𝘥 𝘵𝘰 𝘶𝘴𝘦 𝘵𝘩𝘪𝘴 𝘤𝘰𝘮𝘮𝘢𝘯𝘥.");
        return;
    }

    const months = parseInt(match[1]); // Subscription duration in months
    const targetUserId = parseInt(match[2]); // User ID to upgrade
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + months * 30); // Calculate expiry date (30 days per month)

    await updateUserSubscription(targetUserId, "premium", expiryDate);

    bot.sendMessage(chatId, `✅ 𝘜𝘴𝘦𝘳 ${targetUserId} 𝘩𝘢𝘴 𝘣𝘦𝘦𝘯 𝘶𝘱𝘨𝘳𝘢𝘥𝘦𝘥 𝘵𝘰 𝘗𝘳𝘦𝘮𝘪𝘶𝘮 𝘧𝘰𝘳 ${months} 𝘮𝘰𝘯𝘵𝘩(𝘴).`);
    bot.sendMessage(targetUserId, `🎉 𝘠𝘰𝘶𝘳 𝘴𝘶𝘣𝘴𝘤𝘳𝘪𝘱𝘵𝘪𝘰𝘯 𝘩𝘢𝘴 𝘣𝘦𝘦𝘯 𝘶𝘱𝘨𝘳𝘢𝘥𝘦𝘥 𝘵𝘰 𝘗𝘳𝘦𝘮𝘪𝘶𝘮 𝘧𝘰𝘳 ${months} 𝘮𝘰𝘯𝘵𝘩(𝘴)! \n\n𝘌𝘹𝘱𝘪𝘳𝘦𝘴 𝘰𝘯: ${expiryDate.toDateString()}`);
});

// Command: /removeuser <user_id>
bot.onText(/\/removeuser (\d+)/, async (msg, match) => {
    const chatId = msg.chat.id;

    if (!isAdmin(chatId)) {
        bot.sendMessage(chatId, "❌ 𝘠𝘰𝘶 𝘢𝘳𝘦 𝘯𝘰𝘵 𝘢𝘶𝘵𝘩𝘰𝘳𝘪𝘻𝘦𝘥 𝘵𝘰 𝘶𝘴𝘦 𝘵𝘩𝘪𝘴 𝘤𝘰𝘮𝘮𝘢𝘯𝘥.");
        return;
    }

    const targetUserId = parseInt(match[1]);

    await updateUserSubscription(targetUserId, "free", null);

    bot.sendMessage(chatId, `✅ 𝘜𝘴𝘦𝘳 ${targetUserId} 𝘩𝘢𝘴 𝘣𝘦𝘦𝘯 𝘥𝘰𝘸𝘯𝘨𝘳𝘢𝘥𝘦𝘥 𝘵𝘰 𝘍𝘳𝘦𝘦.`);
    bot.sendMessage(targetUserId, "📉 𝘠𝘰𝘶𝘳 𝘴𝘶𝘣𝘴𝘤𝘳𝘪𝘱𝘵𝘪𝘰𝘯 𝘩𝘢𝘴 𝘣𝘦𝘦𝘯 𝘥𝘰𝘸𝘯𝘨𝘳𝘢𝘥𝘦𝘥 𝘵𝘰 𝘍𝘳𝘦𝘦.");
});

bot.onText(/\/broadcast (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    if (!isAdmin(chatId)) {
        bot.sendMessage(chatId, "❌ 𝘠𝘰𝘶 𝘢𝘳𝘦 𝘯𝘰𝘵 𝘢𝘶𝘵𝘩𝘰𝘳𝘪𝘴𝘦𝘥 𝘵𝘰 𝘶𝘴𝘦 𝘵𝘩𝘪𝘴 𝘤𝘰𝘮𝘮𝘢𝘯𝘥.");
        return;
    }

    const message = match[1];
    const sentCount = await broadcastMessage(bot, message);
    bot.sendMessage(chatId, `✅ Broadcast sent to ${sentCount} users.`);
});

// Command: /stats (Check Database Stats)
bot.onText(/\/stats/, async (msg) => {
    const chatId = msg.chat.id;
    if (!isAdmin(chatId)) {
        bot.sendMessage(chatId, "❌ 𝘠𝘰𝘶 𝘢𝘳𝘦 𝘯𝘰𝘵 𝘢𝘶𝘵𝘩𝘰𝘳𝘪𝘴𝘦𝘥 𝘵𝘰 𝘶𝘴𝘦 𝘵𝘩𝘪𝘴 𝘤𝘰𝘮𝘮𝘢𝘯𝘥.");
        return;
    }

    const stats = await getDatabaseStats();
    const statsMessage = `
<blockquote>Database Statistics</blockquote>  
👥 Total Users: ${stats.totalUsers}  
🎥 Total Videos: ${stats.totalVideos}  
💾 Storage Used: ${stats.storageUsedPercent}  
`;

    bot.sendMessage(chatId, statsMessage, { parse_mode: "HTML" });
});

console.log("✅ Admin module loaded.");
