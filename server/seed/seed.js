const Player=require('../models/Player');
const playersData=require('./playersData');
const mongoose=require('mongoose');
require('dotenv').config();

const runseed = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        await Player.deleteMany({});
        console.log('Existing players deleted');

        await Player.insertMany(playersData);
        console.log('Players seeded successfully');
        process.exit(0);
    }
    catch(err){
        console.error('Error seeding players:', err.message);
        process.exit(1);
    }
}

runseed();