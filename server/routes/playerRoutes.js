const express = require('express');
const Player = require('../models/Player');
const protect = require('../middleware/authMiddleware');
const isAdmin = require('../middleware/adminMiddleware');
const Team = require("../models/Team");
const AuctionState = require("../models/AuctionState");
const mongoose = require('mongoose');
const { getRating, ratingToPool } = require('../gemini/rating');

const router=express.Router();

router.post('/',protect,isAdmin,async(req,res)=>{
    try{
        const { userId, ...playerData } = req.body;
        const player = await Player.create({ ...playerData, user: userId || null });
        try{
            const rating = await getRating(player);
            const state = await AuctionState.findById('singleton');
            const pool = ratingToPool(rating);
            const poolPrices = {
                marquee: state?.marqueeBasePrice || 4800000,
                elite: state?.eliteBasePrice || 2400000,
                rookie: state?.rookieBasePrice || 1200000
            };
            player.overallRating = rating;
            player.pool = pool;
            player.basePrice = poolPrices[pool];
            await player.save();
        }
        catch(ratingErr){
            console.log(`Rating failed for ${player.name}:`, ratingErr.message);
        }
        res.status(201).json(player);
    }
    catch(err){
        res.status(500).json({message:err.message});
    }
});

router.get('/',protect,async(req,res)=>{
    try{
        const player=await Player.find();
        res.status(200).json(player);
    }
    catch(err){
        res.status(500).json({message:err.message});
    }
});

router.get('/me/profile',protect,async (req,res)=>{
    try{
        const player= await Player.findOne({user: req.user.id})
        if(!player){
            return res.status(404).json({message:"No player profile found for this user"});
        }
        res.json(player);
    }
    catch(err){
        res.status(500).json({message:err.message});   
    }
})

router.get('/:id',protect,async(req,res)=>{
    try{
        const player=await Player.findById(req.params.id);
        if(!player){
            return res.status(404).json({message:"Player not found"});
        }
        res.status(200).json(player);
    }
    catch(err){
        res.status(500).json({message:err.message});
    }
});

router.put('/:id',protect,isAdmin,async(req,res)=>{
    try{
        const player=await Player.findByIdAndUpdate(req.params.id,req.body,{
            new:true,
            runValidators:true
        });
        if(!player){
            return res.status(404).json({message:"Player not found"});
        }
        try{
            const rating = await getRating(player);
            player.overallRating = rating;
            player.pool = ratingToPool(rating);
            await player.save();
        }
        catch(ratingErr){
            console.log(`Rating update failed for ${player.name}:`, ratingErr.message);
        }
        res.status(200).json(player);
    }
    catch(err){
        res.status(500).json({message:err.message});
    }
});

router.put('/:id/rate',protect,isAdmin,async (req,res)=>{
    try{
        const player=await Player.findById(req.params.id);
        if(!player){
            return res.status(404).json({message:"Player not found"});
        }
        const rating = await getRating(player);
        player.overallRating = rating;
        player.pool = ratingToPool(rating);
        await player.save();
        res.json(player);
    }
    catch(err){
        res.status(500).json({message:err.message});
    }
});

router.delete('/:id',protect,isAdmin,async(req,res)=>{
    try{
        const player=await Player.findByIdAndDelete(req.params.id);
        if(!player){
            return res.status(404).json({message:"Player not found"});
        }
        res.status(200).json({message:"Player deleted successfully"});
    }
    catch(err){
        res.status(500).json({message:err.message});
    }
});

router.put('/me/register',protect,async (req,res)=>{
    try{
        if (req.user.role === 'captain') {
            return res.status(403).json({ message: 'Captains cannot register for the auction' });
        }
        const player= await Player.findOne({user: req.user.id})
        if(!player){
            return res.status(404).json({message:"No player profile found for this user"});
        }

        player.status='registered';
        await player.save();

        res.json(player);
    }
    catch(err){
        res.status(500).json({message:err.message});   
    }
});

router.put('/:id/retain',protect,async (req,res)=>{
    try{
        if(req.user.role!=='captain'){
            return res.status(403).json({ message: 'Only captains can retain players' });
        }
    
        const team = await Team.findOne({captain: req.user.id});
        if(!team){
            return res.status(400).json({ message: 'You do not own a team yet' });
        }

        const alreadyRetained = await Player.countDocuments({ retainedBy: team._id });
        if (alreadyRetained >= 1) {
            return res.status(400).json({ message: 'You have already used your one retention' });
        }

        const player=await Player.findById(req.params.id);
        if(!player){
            return res.status(404).json({ message: 'Player not found' });
        }
        if (!player.previouslyReleasedBy || player.previouslyReleasedBy.toString() !== team._id.toString()) {
            return res.status(400).json({ message: 'You can only retain a player you previously released' });
        }
        if(player.retainedBy){
            return res.status(400).json({ message: 'This player is already retained by a team' });
        }
        const state = await AuctionState.findById('singleton');
        const price = state?.retentionPrice || 33200000;
        
        if (price > team.remainingPurse) {
            return res.status(400).json({ message: 'Insufficient purse for this retention' });
        }
        player.retainedBy=team._id;
        player.retentionPrice=price;
        player.status="sold";
        await player.save();

        team.remainingPurse-=price;
        team.players.push(player._id);
        await team.save();

        res.json(player);
    }
    catch(err){
        res.status(500).json({message:err.message});
    }
});

router.put("/:id/release",protect,async(req,res)=>{
    try{
        const player = await Player.findById(req.params.id);
        if(!player){
            return res.status(404).json({ message: 'Player not found' });
        }
        const teamId = player.soldTo || player.retainedBy;
        if(!teamId){
            return res.status(400).json({ message: 'This player is not on any team' });
        }
        const team=await Team.findById(teamId);
        if(!team){
            return res.status(404).json({ message: 'Team not found' });
        }
        if(team.captain.toString()!==req.user.id){
            return res.status(403).json({ message: 'Only the captain can release a player' });
        }
        const refund = player.soldPrice || player.retentionPrice || 0;
        const session=await mongoose.startSession();
        try{
            await session.withTransaction(async()=>{
                team.remainingPurse+=refund;
                team.players =  team.players.filter((p)=>p.toString() !== player._id.toString());
                await team.save({session});

                player.status='unsold-final';
                player.soldTo=null;
                player.soldPrice=null;
                player.previouslyReleasedBy=teamId;
                player.retainedBy=null;
                player.retentionPrice=null;
                await player.save({session});
            });

            res.json({ message: `${player.name} released, ₹${refund} refunded to purse` });
        }
        finally{
            await session.endSession();
        }
    }
    catch(err){
        res.status(500).json({message:err.message});
    }
});

router.get('/:id/rtm-eligible',protect,async(req,res)=>{
    try{
        if(req.user.role!=='captain'){
            return res.json({ eligible: false });
        }
        const player = await Player.findById(req.params.id);
        if(!player || !player.previouslyReleasedBy){
            return res.json({eligible:false});
        }
        const team=await Team.findOne({captain:req.user.id});
        if(!team){
            return res.json({eligible:false});
        }
        const isFormerTeam = player.previouslyReleasedBy.toString()===team._id.toString();
        const alreadyUsed = player.rtmUsedBy.some((p)=>p.toString()===team._id.toString());

        res.json({eligible: isFormerTeam && !alreadyUsed, teamId: team._id});
    }
    catch(err){
        res.status(500).json({message:err.message});
    }
})

module.exports=router;