const AuctionState = require('../models/AuctionState');
const Player = require('../models/Player');
const Team = require('../models/Team');

let ioInstance = null;
let currentTimer = null;

const initEngine = (io)=>{
    ioInstance=io;
};

const scheduleTimer = (durationMx)=>{
    if(currentTimer){
        clearTimeout(currentTimer);
    }
    currentTimer=setTimeout(handleTimeout,durationMx);
}

const startNextPlayer = async() =>{
    const state=await AuctionState.findById('singleton');
    if(!state.playerQueue || state.playerQueue.length===0){
        state.status='ended';
        state.currentPlayer=null;
        await state.save();
        ioInstance.emit('auction:ended');
        return;
    }

    const nextPlayerId=state.playerQueue[0];
    state.playerQueue=state.playerQueue.slice(1);

    const player=await Player.findById(nextPlayerId);

    state.currentPlayer=nextPlayerId;
    state.currentBid=player.basePrice;
    state.currentBidder=null;
    state.timerEndsAt=new Date(Date.now()+30000);

    await state.save();

    ioInstance.emit('auction:playerUp',{
        player,
        currentBid:state.currentBid,
        timerEndsAt:state.timerEndsAt
    });

    console.log(`Player up: ${player.name}, timer ends at ${state.timerEndsAt}`);

    scheduleTimer(30000);

};

const handleTimeout=async ()=>{
    const state=await AuctionState.findById('singleton');
    console.log(`Timer expired for player ${state.currentPlayer}, currentBidder: ${state.currentBidder}`);
    ioInstance.emit('auction:timerExpired', { playerId: state.currentPlayer });

    await startNextPlayer();
};

const placeBid = async (userId,amount)=>{
    const state=await AuctionState.findById('singleton');
    if(state.status!=='live'){
        return { success: false, message: 'Auction is not live' };
    }
    if (!state.currentPlayer) {
        return { success: false, message: 'No player currently up for auction' };
    }
    const team=await Team.findOne({captain:userId});
    if (!team) {
        return { success: false, message: 'You do not own a team' };
    }
    if (team.players.length >= state.squadSize) {
        return { success: false, message: 'Your squad is already full' };
    }
    const minValidBid=state.currentBid+state.minIncrement;
    if (amount < minValidBid) {
        return { success: false, message: `Bid must be at least ${minValidBid}` };
    }
    if (amount > team.remainingPurse) {
        return { success: false, message: 'Insufficient purse for this bid' };
    }
    state.currentBid=amount;
    state.currentBidder=team._id;
    await state.save();
    ioInstance.emit('auction:bidUpdate',{
        currentBid:state.currentBid,
        currentBidder:{
            _id:team._id,
            name:team.name
        }
    });
    const bidded=await Player.findById(state.currentPlayer);
    console.log(`Bid placed: ${team.name} bid ${amount} on player ${bidded.name}`);
    return { success: true };
};

module.exports={initEngine,startNextPlayer,placeBid}