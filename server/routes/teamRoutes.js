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
            purse,
            remainingPurse: purse
        });
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

router.get('/unassigned/list',protect,async (req,res)=>{
    try{
        const team=await Team.find({captain: null});
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

router.put('/:id/select',protect,async (req,res)=>{
    try{
        if(req.user.role!=='captain'){
            res.status(403).json({message:"Only captains can select a team"})
        }
        const existingTeam=await Team.findOne({captain:req.user.id});
        if(existingTeam){
            return res.status(400).json({ message: 'You already own a team' });
        }
        const team = await Team.findById(req.params.id);
        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }
        if (team.captain) {
            return res.status(400).json({ message: 'This team is already taken' });
        }
        team.captain=req.user.id;
        await team.save();

        await User.findByIdAndUpdate(req.user.id,{team:team._id});
        res.json(team);
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