const express = require('express');
const Team = require('../models/Team');
const Trade = require('../models/Trade');
const protect = require('../middleware/authMiddleware');
const isAdmin = require('../middleware/adminMiddleware');
const mongoose = require('mongoose');
const Player = require('../models/Player');

const router = express.Router();

router.post('/',protect,async (req,res)=>{
    try{
        if(req.user.role!=='captain'){
            return res.status(403).json({ message: 'Only captains can propose trades' });
        }
        const {toTeamId, offeredPlayerId, offeredPurse, requestedPlayerId} = req.body;
        if(!requestedPlayerId){
            return res.status(400).json({ message: 'A requested player is required' });
        }
        if(!offeredPlayerId && (!offeredPurse || offeredPurse <= 0)){
            return res.status(400).json({ message: 'You must offer a player or purse in return' });
        }
        const fromTeam = await Team.findOne({captain:req.user.id});
        if(!fromTeam){
            return res.status(400).json({ message: 'You do not own a team' });
        }
        if(fromTeam._id.toString()===toTeamId){
            return res.status(400).json({ message: 'Cannot trade with your own team' });
        }
        if(offeredPlayerId){
            const ownsOffered = fromTeam.players.some((p)=>p.toString()===offeredPlayerId);
            if(!ownsOffered){
                return res.status(400).json({ message: 'You do not own the offered player' });
            }
        }
        if(offeredPurse && offeredPurse>fromTeam.remainingPurse){
            return res.status(400).json({ message: 'Insufficient purse to offer' });
        }
        const toTeam = await Team.findById(toTeamId);
        if(!toTeam){
            return res.status(404).json({ message: 'Target team not found' });
        }
        const theyOwnRequested= toTeam.players.some((p)=>p.toString()===requestedPlayerId);
        if(!theyOwnRequested){
            return res.status(400).json({ message: 'Target team does not own the requested player' });
        }

        const trade = await Trade.create({
            fromTeam: fromTeam._id,
            toTeam: toTeamId,
            offeredPlayer: offeredPlayerId || null,
            offeredPurse: offeredPurse || 0,
            requestedPlayer: requestedPlayerId
        });
        
        res.status(201).json(trade);
    }
    catch(err){
        res.status(500).json({message:err.message});
    }
});

router.get('/incoming',protect,async (req,res)=>{
    try{
        if(req.user.role!=='captain'){
            return res.json([]);
        }
        const team=await Team.findOne({captain:req.user.id});
        if(!team){
            return res.json([]);
        }
        const trades=await Trade.find({toTeam:team._id,status:'pending'})
        .populate("fromTeam","name")
        .populate("offeredPlayer","name role")
        .populate("requestedPlayer","name role");
        
        res.json(trades);
    }
    catch(err){
        res.status(500).json({message:err.message});
    }
});

router.put('/:id/accept',protect,async (req,res)=>{
    try{
        const trade = await Trade.findById(req.params.id);
        if(!trade){
            return res.status(404).json({ message: 'Trade not found' });
        }
        const toTeam = await Team.findById(trade.toTeam);
        if(toTeam.captain.toString()!==req.user.id){
            return res.status(403).json({ message: 'Only the receiving captain can accept this trade' });
        }
        if(trade.status!=='pending'){
            return res.status(400).json({ message: 'This trade is no longer pending' });
        }
        trade.status="accepted";
        await trade.save();
        res.json(trade);
    }
    catch(err){
        res.status(500).json({message:err.message});
    }
});

router.put('/:id/reject',protect,async (req,res)=>{
    try{
        const trade = await Trade.findById(req.params.id);
        if(!trade){
            return res.status(404).json({ message: 'Trade not found' });
        }
        const toTeam = await Team.findById(trade.toTeam);
        if(toTeam.captain.toString()!==req.user.id){
            return res.status(403).json({ message: 'Only the receiving captain can accept this trade' });
        }
        if(trade.status!=='pending'){
            return res.status(400).json({ message: 'This trade is no longer pending' });
        }
        trade.status="rejected";
        await trade.save();
        res.json(trade);
    }
    catch(err){
        res.status(500).json({message:err.message});
    }
});

router.get('/pending-request',protect,isAdmin,async (req,res)=>{
    try{
        const trades = await Trade.find({status:"accepted"})
        .populate("fromTeam","name")
        .populate("toTeam","name")
        .populate("offeredPlayer","name role")
        .populate("requestedPlayer","name role");

        res.json(trades);
    }
    catch(err){
        res.status(500).json({message:err.message});
    }
});

router.put('/:id/approve',protect,isAdmin,async (req,res)=>{
    try{
        const trade = await Trade.findById(req.params.id);
        if(!trade){
            return res.status(404).json({ message: 'Trade not found' });
        }
        if(trade.status!=='accepted'){
            return res.status(400).json({ message: 'Trade must be accepted before approval' });
        }
        const session = await mongoose.startSession();
        try{
            await session.withTransaction(async ()=>{
                const fromTeam = await Team.findById(trade.fromTeam).session(session);
                const toTeam = await Team.findById(trade.toTeam).session(session);
                if(trade.offerPrice>fromTeam.remainingPurse){
                    throw new Error('Offering team no longer has sufficient purse');
                }
                if(trade.offeredPurse > 0 && toTeam.remainingPurse + trade.offeredPurse < 0){
                    throw new Error('Purse calculation error');
                }
                const requestedPlayer = await Player.findById(trade.requestedPlayer).session(session);
                const stillOwnsRequested = toTeam.players.some((p)=>p.toString()===requestedPlayer._id.toString());
                if(!stillOwnsRequested){
                    throw new Error('Target team no longer owns the requested player');
                }
                toTeam.players=toTeam.players.filter((p)=>p.toString()!==requestedPlayer._id.toString());
                fromTeam.players.push(requestedPlayer._id);
                requestedPlayer.soldTo=fromTeam._id;

                if(trade.offeredPlayer){
                    const offeredPlayer = await Player.findById(trade.offeredPlayer).session(session);
                    const stillOwnsOffered = fromTeam.players.some((p)=>p.toString()===offeredPlayer._id.toString());
                    if(!stillOwnsOffered){
                        throw new Error('Offering team no longer owns the offered player');
                    }
                    fromTeam.players=fromTeam.players.filter((p)=>p.toString()!==offeredPlayer._id.toString());
                    toTeam.players.push(offeredPlayer._id);
                    offeredPlayer.soldTo=toTeam._id;
                    await offeredPlayer.save({session});
                }

                if(trade.offeredPurse>0){
                    toTeam.remainingPurse+=trade.offeredPurse;
                    fromTeam.remainingPurse-=trade.offeredPurse;
                }

                await requestedPlayer.save({session});
                await fromTeam.save({session});
                await toTeam.save({session});

                trade.status="completed";
                await trade.save({session});
            });
            res.json({ message: 'Trade completed successfully' });
        }
        finally{
            await session.endSession();
        }
    }
    catch(err){
        res.status(500).json({message:err.message});
    }
});

module.exports = router;