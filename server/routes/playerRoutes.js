const express = require('express');
const Player = require('../models/Player');
const protect = require('../middleware/authMiddleware');
const isAdmin = require('../middleware/adminMiddleware');
const Team = require("../models/Team");
const AuctionState = require("../models/AuctionState");

const router=express.Router();

router.post('/',protect,isAdmin,async(req,res)=>{
    try{
        const player=await Player.create(req.body);
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
        res.status(200).json(player);
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
        if(req.user?.role!=='captain'){
            return res.status(403).json({ message: 'Only captains can retain players' });
        }
        const { price } = req.body;
        if(price===undefined){
            return res.status(400).json({ message: 'Retention price is required' });
        }
        const team = await Team.findOne({captain: req.user.id});
        if(!team){
            return res.status(400).json({ message: 'You do not own a team yet' });
        }
        const state=await AuctionState.findOne();
        if (price < state.minRetentionPrice || price > state.maxRetentionPrice) {
            return res.status(400).json({
              message: `Price must be between ${state.minRetentionPrice} and ${state.maxRetentionPrice}`
            });
        }
        const alreadyRetainedCount = await Player.countDocuments({ retainedBy: team._id });
        if (alreadyRetainedCount >= state.maxRetentions) {
            return res.status(400).json({ message: 'You have reached your retention limit' });
        }
        if (price > team.remainingPurse) {
            return res.status(400).json({ message: 'Insufficient purse for this retention' });
        }
        const player=await Player.findById(req.params.id);
        if(!player){
            return res.status(404).json({ message: 'Player not found' });
        }
        if(player.retainedBy){
            return res.status(400).json({ message: 'This player is already retained by a team' });
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

module.exports=router;