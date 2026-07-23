const AuctionState = require('../models/AuctionState');
const Player = require('../models/Player');

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

module.exports={initEngine,startNextPlayer}