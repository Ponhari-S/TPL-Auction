const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['batsman', 'bowler', 'all-rounder'],
        required: true
    },
    basePrice: {
        type: Number,
        required: true
    },
    stats: {
      matches: { type: Number, default: 0 },
      runs: { type: Number, default: 0 },
      wickets: { type: Number, default: 0 },
      average: { type: Number, default: 0 },
      strikeRate: { type: Number, default: 0 }
    },
    overallRating: {
        type: Number,
        default: null
    },
    status: {
      type: String,
      enum: ['registered', 'unsold', 'sold', 'unsold-final'],
      default: 'registered'
    },
    soldPrice: {
        type: Number,
        default: null
    },
    soldTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team',
        default: null
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    pool:{
        type:String,
        enum:['marquee','elite','rookie'],
        default:null
    }
},
{timestamps: true});

module.exports = mongoose.model('Player', playerSchema);