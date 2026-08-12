const mongoose = require('mongoose');

const tradeSchema = new mongoose.Schema({
    fromTeam:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Team',
        required: true
    },
    toTeam:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Team',
        required: true
    },
    offeredPlayer:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Player',
        default:null
    },
    offeredPurse:{
        type:Number,
        default: 0
    },
    requestedPlayer:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Player',
        default:null
    },
    status:{
        type:String,
        enum:['pending', 'accepted', 'rejected', 'admin-approved', 'completed', 'cancelled'],
        default:'pending'
    }
},{timestamps:true});

module.exports = mongoose.model('Trade',tradeSchema);