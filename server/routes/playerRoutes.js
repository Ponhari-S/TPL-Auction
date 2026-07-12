const express = require('express');
const Player = require('../models/Player');
const protect = require('../middleware/authMiddleware');
const isAdmin = require('../middleware/adminMiddleware');

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
})

module.exports=router;