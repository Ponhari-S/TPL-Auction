const express=require('express');
const Team = require('../models/Team');
const User = require('../models/User');
const protect = require('../middleware/authMiddleware');
const isAdmin = require('../middleware/adminMiddleware');

const router = express.Router();

router.post('/',protect,isAdmin,async (req,res)=>{
    try{
        const {name, logo, captain, purse} = req.body;

        const team = await Team.create({
            name,
            logo,
            captain,
            purse,
            remainingPurse: purse
        });
        await User.findByIdAndUpdate(captain,{team:team._id});
        res.status(201).json(team);
    }
    catch(err){
        res.status(500).json({message:err.message});
    }
});

router.get('/',protect,async (req,res)=>{
    try{
        const team= await Team.find().populate('captain','name email').populate('players');
        res.json(team);
    }
    catch(err){
        res.status(500).json({message:err.message});
    }
});

router.get('/:id',protect,async (req,res)=>{
    try{
        const team=await Team.findById(req.params.id).populate('captain','name email').populate('players');
        if(!team){
            return res.status(404).json({message:"Team not found !!"});
        }
        res.send(team);
    }
    catch(err){
        res.status(500).json({message:err.message});
    }
});

router.put('/:id',protect,isAdmin,async (req,res)=>{
    try{
        const team=await Team.findById(req.params.id).populate('captain','name email').populate('players');
        if(!team){
            return res.status(404).json({message:"Team not found !!"});
        }
        const isOwner=team.owner.toString()===req.user.id;
        if(!isOwner && req.user.role!='admin'){
            return res.status(403).json({message:"Not authorized to edit this team"});
        }
        const updated=await Team.findByIdAndUpdate(req.params.id,req.body,{
            new: true,
            runValidators: true
        });
        res.json(updated);
    }
    catch(err){
        res.status(500).json({message:err.message});   
    }
});

router.delete('/:id',protect,isAdmin,async (req,res)=>{
    try{
        const team= await Team.findByIdandDelete(req.params.id);
        if(!team){
            return res.status(404).json({message:"Team not found!!!"});
        }
        res.json({message:"Team deleted"});
    }
    catch(err){
        res.status(500).json({message:err.message});
    }
});

module.exports = router;