const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    logo:{
        type:String,
        required:true
    },
    captain:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default:null
    },
    purse:{
        type:Number,
        required:true
    },
    remainingPurse:{
        type:Number,
        required:true
    },
    players:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Player'
    }]
},
{timestamps:true});

module.exports=mongoose.model('Team',teamSchema);