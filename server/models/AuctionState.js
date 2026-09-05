const mongoose=require('mongoose');

const auctionStateSchema=new mongoose.Schema({
    _id: { type: String, default: 'singleton' },
    status: {
      type: String,
      enum: ['not-started', 'live', 'paused', 'ended'],
      default: 'not-started'
    },
    currentPlayer:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Player',
        default:null
    },
    currentBid:{
        type:Number,
        default:0
    },
    currentBidder:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Team',
        default:null
    },
    timerEndsAt:{
        type:Date,
        default:null
    },
    playerQueue:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Player'
    }],
    minIncrement:{
        type:Number,
        default:500000
    },
    captainFee: { type: Number, default: 43200000 },
    marqueeBasePrice: { type: Number, default: 4800000 },
    eliteBasePrice: { type: Number, default: 2400000 },
    rookieBasePrice: { type: Number, default: 1200000 },
    minBidIncrementRules: {
        type: [{ upTo: Number, increment: Number }],
        default: [
          { upTo: 10000000, increment: 500000 },
          { upTo: 20000000, increment: 1000000 },
          { upTo: 50000000, increment: 2000000 },
          { upTo: 100000000, increment: 5000000 },
          { upTo: Infinity, increment: 10000000 }
        ]
      },
    squadSize:{
        type:Number,
        default: 6
    },
    retentionPrice: { type: Number, default: 33200000 }
})

module.exports=mongoose.model('AuctionState',auctionStateSchema);