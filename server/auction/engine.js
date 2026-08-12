const AuctionState = require('../models/AuctionState');
const Player = require('../models/Player');
const Team = require('../models/Team');
const mongoose = require('mongoose');

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

let pausedTimeRemaining = null;

const pauseTimer = () => {
  if (currentTimer) {
    clearTimeout(currentTimer);
    currentTimer = null;
  }
};

const resumeTimer = async () => {
  const state = await AuctionState.findById('singleton');
  if (!state.currentPlayer || !state.timerEndsAt) return;

  const remaining = new Date(state.timerEndsAt).getTime() - Date.now();
  const durationMs = remaining > 0 ? remaining : 1000;

  currentTimer = setTimeout(handleTimeout, durationMs);
};

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
    const player=await Player.findById(state.currentPlayer);
    if(state.currentBidder){
        const session=await mongoose.startSession();
        try{
            await session.withTransaction(async() =>{
                const team=await Team.findById(state.currentBidder).session(session);
                player.status='sold';
                player.soldTo=team._id;
                player.soldPrice=state.currentBid;
                await player.save({session});

                team.remainingPurse -= state.currentBid;
                team.players.push(player._id);
                await team.save({session});
            });
            const team = await Team.findById(state.currentBidder);
            ioInstance.emit('auction:playerSold',{
                player,
                team: {
                    _id: team._id,
                    name: team.name
                },
                soldPrice: state.currentBid
            });
            console.log(`SOLD: ${player.name} to ${team.name} for ${state.currentBid}`);
        }
        catch(transactionErr){
            console.error('Sale transaction failed:', transactionErr.message);
        }
        finally{
            await session.endSession();
        }
    }
    else{
        if(player.status==='unsold'){
            player.status='unsold-final';
            await player.save();

            ioInstance.emit('auction:playerUnsoldFinal');
            console.log(`UNSOLD-FINAL: ${player.name}`);
        }
        else{
            const session = await mongoose.startSession();
            try{
                await session.withTransaction(async () => {
                    player.status='unsold';
                    await player.save({session});

                    state.playerQueue.push(player._id);
                    await state.save({session});
                });
                ioInstance.emit('auction:playerUnsold',{player});
                console.log(`UNSOLD : ${player.name}`);
            }
            catch(transactionErr){
                console.log('Requeue transaction failed:', transactionErr.message);
            }
            finally{
                await session.endSession();
            }
        }
    }
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

    const newTimerEndsAt=new Date(Date.now()+15000);

    const updatedState=await AuctionState.findOneAndUpdate({
        _id:"singleton",
        currentBid: state.currentBid,
        currentPlayer: state.currentPlayer
    },
    {
        currentBid: amount,
        currentBidder: team._id,
        timerEndsAt: newTimerEndsAt
    },
    {
        new: true
    });

    if (!updatedState) {
        return { success: false, message: 'Bid rejected — someone else bid first, try again' };
    }

    scheduleTimer(15000);

    ioInstance.emit('auction:bidUpdate',{
        currentBid:updatedState.currentBid,
        currentBidder:{
            _id:team._id,
            name:team.name
        },
        timerEndsAt:updatedState.timerEndsAt
    });
    console.log(`Bid placed: ${team.name} bid ${amount} on player ${state.currentPlayer.name}`);
    return { success: true };
};

const useRtm = async (userId) => {
    const state = await AuctionState.findById('singleton');
    if(state.status!=='live' || !state.currentPlayer){
        return { success: false, message: 'Auction is not live' };
    }
    const team = await Team.findOne({captain:userId});
    if(!team){
        return { success: false, message: 'You do not own a team' };
    }
    const player = await Player.findById(state.currentPlayer);
    if(!player.previouslyReleasedBy || player.previouslyReleasedBy.toString()!==team._id.toString()){
        return { success: false, message: 'You are not eligible to RTM this player' };
    }
    const alreadyUsed = player.rtmUsedBy.some((p)=>p.toString()===team._id.toString());
    if(alreadyUsed){
        return { success: false, message: 'You have already used RTM on this player' };
    }
    if(team.players.length>=state.squadSize){
        return { success: false, message: 'Your squad is already full' };
    }

    if (state.currentBidder.toString() === team._id.toString()) {
        return { success: false, message: 'You are already the highest bidder' };
    }

    if (!state.currentBidder) {
        return { success: false, message: 'No bid to match yet' };
    }
    if(state.currentBid>team.remainingPurse){
        return { success: false, message: 'Insufficient purse to match this bid' };
    }
    const updatedState = await AuctionState.findOneAndUpdate({_id:'singleton',currentPlayer:state.currentPlayer},{currentBidder:team._id},{new: true});
    if(!updatedState){
        return { success: false, message: 'Player changed before RTM could be applied' };
    }
    player.rtmUsedBy.push(team._id);
    await player.save();

    scheduleTimer(0);
    ioInstance.emit('auction:rtmUsed',{
        currentBid:updatedState.currentBid,
        currentBidder:{_id:team._id,name:team.name},
        timerEndsAt: new Date(Date.now() + 15000)
    });
    console.log(`RTM: ${team.name} matched bid for player ${state.currentPlayer}`);
    return {success:true};
}

module.exports={initEngine,startNextPlayer,placeBid,pauseTimer,resumeTimer,useRtm};