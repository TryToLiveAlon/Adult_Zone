const { MongoClient } = require('mongodb');
const config = require('./config');

const client = new MongoClient(config.mongoURI);
const videoClient = new MongoClient(config.mongoVideoURI); // Video DB
const dbName = 'video_bot_db';
const videoDbName = 'video_db';
let db, videoDb;

// Connect to MongoDB
async function connectDB() {
    await client.connect();
    db = client.db(dbName);
    await videoClient.connect();
    videoDb = videoClient.db(videoDbName);
    console.log('✅ Connected to MongoDB');
}

// Get user data or create a new user if not found
async function getUserData(chatId, firstName = "Unknown") {
    const usersCollection = db.collection('users');
    let user = await usersCollection.findOne({ chat_id: chatId });

    if (!user) {
        user = {
            chat_id: chatId,
            first_name: firstName,
            video_count: 0,
            subscription_plan: 'free',
            expiry_date: null, // Expiry date for premium users
            last_request_date: new Date(),
        };
        await usersCollection.insertOne(user);
    }
    return user;
}

// Update user data: Increase video count
async function updateUserData(chatId, newVideoCount) {
    const usersCollection = db.collection('users');
    await usersCollection.updateOne(
        { chat_id: chatId },
        { $set: { video_count: newVideoCount, last_request_date: new Date() } }
    );
}

// Set user's subscription plan and expiry date
async function updateUserSubscription(chatId, plan, months = 0) {
    const usersCollection = db.collection('users');

    let expiryDate = null;
    if (plan === "premium") {
        expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + months * 30); // Calculate expiry date
    }

    await usersCollection.updateOne(
        { chat_id: chatId },
        { $set: { subscription_plan: plan, expiry_date: expiryDate } }
    );
}

// Get total users count
async function getUserCount() {
    const usersCollection = db.collection('users');
    return await usersCollection.countDocuments();
}

// Get total videos count
async function getVideoCount() {
    const videosCollection = videoDb.collection('videos');
    return await videosCollection.countDocuments();
}

// Get database statistics
async function getDatabaseStats() {
    const stats = await db.stats();
    const videoStats = await videoDb.stats();
    
    const usedStorage = ((stats.dataSize + videoStats.dataSize) / stats.storageSize) * 100;

    return {
        totalUsers: await getUserCount(),
        totalVideos: await getVideoCount(),
        storageUsedPercent: usedStorage.toFixed(2) + "%",
    };
}

// Broadcast a message to all users
async function broadcastMessage(bot, message) {
    const usersCollection = db.collection('users');
    const users = await usersCollection.find({}, { projection: { chat_id: 1 } }).toArray();

    let sentCount = 0;
    for (const user of users) {
        try {
            await bot.sendMessage(user.chat_id, `𝘉𝘳𝘰𝘢𝘥𝘤𝘢𝘴𝘵:\n\n${message}`);
            sentCount++;
        } catch (error) {
            console.error(`❌ Failed to send message to ${user.chat_id}:`, error.message);
        }
    }

    return sentCount;
}

// Check and downgrade expired premium users
async function checkExpiredSubscriptions(bot) {
    const usersCollection = db.collection('users');
    const now = new Date();

    const expiredUsers = await usersCollection.find({
        subscription_plan: "premium",
        expiry_date: { $lt: now }
    }).toArray();

    for (const user of expiredUsers) {
        await usersCollection.updateOne(
            { chat_id: user.chat_id },
            { $set: { subscription_plan: "free", expiry_date: null } }
        );

        if (bot) {
            bot.sendMessage(user.chat_id, "📌 𝘠𝘰𝘶𝘳 𝘱𝘳𝘦𝘮𝘪𝘶𝘮 𝘴𝘶𝘣𝘴𝘤𝘳𝘪𝘱𝘵𝘪𝘰𝘯 𝘩𝘢𝘷𝘦 𝘣𝘦𝘦𝘯 𝘦𝘹𝘱𝘪𝘳𝘦𝘥. 𝘠𝘰𝘶 𝘢𝘳𝘦 𝘯𝘰𝘸 𝘢 𝘧𝘳𝘦𝘦 𝘶𝘴𝘦𝘳.");
        }
    }

    console.log(`✅ Checked and downgraded ${expiredUsers.length} expired users.`);
}

// Reset daily file usage (for cron job)
async function resetDailyFileUsage() {
    const usersCollection = db.collection('users');
    await usersCollection.updateMany({}, { $set: { video_count: 0, last_request_date: new Date() } });
    console.log("✅ Daily file usage reset.");
}

module.exports = { 
    connectDB, 
    getUserData, 
    updateUserData, 
    updateUserSubscription, 
    getUserCount, 
    getVideoCount, 
    getDatabaseStats, 
    broadcastMessage, 
    checkExpiredSubscriptions, 
    resetDailyFileUsage 
};
