const mongoose=require('mongoose');

const auctionStateSchema=new mongoose.Schema({
    state:{
        type:String,
        enum:['not-started','live','ended','paused'],
        default:'not-started'
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
    minBidIncrementRules:{
        type:Object,
        default:{}
    },
    squadSize:{
        type:Number,
        default: 6
    }
})

module.exports=mongoose.model('AuctionState',auctionStateSchema);