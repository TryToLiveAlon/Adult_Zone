const { MongoClient } = require('mongodb');
const config = require('./config');

const client = new MongoClient(config.mongoVideoURI);
const dbName = 'video_db';
let db;

async function connectVDB() {
    if (!db) {
        await client.connect();
        db = client.db(dbName);
        console.log('✅ Connected to MongoDB (Video DB)');
    }
}

// Function to get the DB instance safely
function getDB() {
    if (!db) {
        throw new Error("Database not initialized. Call connectDB() first.");
    }
    return db;
}

// Add a new video to the database
async function addVideoToDB(videoLink, videoTitle, channelType) {
    await connectVDB();
    const videosCollection = getDB().collection('videos');
    const videoData = {
        video_link: videoLink,
        video_title: videoTitle,
        channel_type: channelType,
        added_at: new Date()
    };
    await videosCollection.insertOne(videoData);
    console.log(`✅ Video added to ${channelType.toUpperCase()} database.`);
}

// Get a random video from the database
async function getRandomVideoFromDB(channelType) {
    await connectVDB();
    const videosCollection = getDB().collection('videos');

    const video = await videosCollection.aggregate([
        { $match: { channel_type: channelType } },
        { $sample: { size: 1 } }
    ]).toArray();

    return video.length ? video[0] : null;
}

module.exports = { connectVDB, getDB, addVideoToDB, getRandomVideoFromDB };
