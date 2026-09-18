const mongoose = require("mongoose");

const bidLogSchema = new mongoose.Schema({
    player: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Player',
        required: true
    },
    team: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        enum: ['bid', 'rtm'],
        default: 'bid'
    }
},
    { timestamps: true });

module.exports = mongoose.model('BidLog', bidLogSchema);