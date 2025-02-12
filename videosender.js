const bot = require('./bot');
const config = require('./config');
const { getUserData, updateUserData } = require('./mongo');
const { getRandomVideoFromDB } = require('./videoSchema');

async function sendRandomVideo(chatId) {
    // Fetch user data
    const user = await getUserData(chatId);
    const dailyLimit = user.subscription_plan === 'premium' ? 30 : 5;
    const filesUsed = user.video_count || 0;
    const remainingFiles = dailyLimit - filesUsed;

    // If user has no remaining file limit, send an error message
    if (remainingFiles <= 0) {
        bot.sendMessage(
            chatId,
            "❌ You have reached your daily limit of video requests. Upgrade to Premium for more videos!"
        );
        return;
    }

    // Determine the correct category (free or premium)
    const subscriptionType = user.subscription_plan === 'premium' ? 'premium' : 'free';

    // Fetch a random video from the video database
    const videoData = await getRandomVideoFromDB(subscriptionType);

    if (!videoData) {
        bot.sendMessage(chatId, "❌ No videos found in your category.");
        return;
    }

    try {
        // Send video to user
        const sentMessage = await bot.sendVideo(chatId, videoData.video_link, {
            caption: `ᴘᴏᴡᴇʀᴇᴅ ʙʏ: <a href="https://t.me/AdultZonelBot">ᴛᴇʀᴀʙᴏx ᴠɪᴅᴇᴏꜱ ʙᴏᴛ 🔞</a>

<blockquote>ᴛʜɪꜱ ꜰɪʟᴇ ᴡɪʟʟ ʙᴇ ᴀᴜᴛᴏ ᴅᴇʟᴇᴛᴇ ᴀꜰᴛᴇʀ 10 ᴍɪɴᴜᴛᴇꜱ. ᴘʟᴇᴀꜱᴇ ꜰᴏʀᴡᴀʀᴅ ᴛʜɪꜱ ꜰɪʟᴇ ꜱᴏᴍᴇᴡʜᴇʀᴇ ᴇʟꜱᴇ ᴏʀ ꜱᴀᴠᴇ ɪɴ ꜱᴀᴠᴇᴅ ᴍᴇꜱꜱᴀɢᴇꜱ.</blockquote>`,
            parse_mode: 'HTML'
            }
                                                );
    
        // Increment the video count for the user
        await updateUserData(chatId, filesUsed + 1);
        console.log(`✅ Video sent to ${chatId} | Used: ${filesUsed + 1}/${dailyLimit}`);

        // Schedule deletion after 10 minutes (600,000 milliseconds)
        setTimeout(async () => {
            try {
                await bot.deleteMessage(chatId, sentMessage.message_id);
                console.log(`🗑️ Video deleted from chat ${chatId}`);
            } catch (error) {
                console.error(`❌ Failed to delete video: ${error.message}`);
            }
        }, 5 * 60 * 1000);

    } catch (error) {
        console.error("❌ Error sending video:", error);
        bot.sendMessage(chatId, `Failed to send the video.`);
    }
}

module.exports = { sendRandomVideo };
