const express=require('express');
const Team = require('../models/Team');
const User = require('../models/User');
const protect = require('../middleware/authMiddleware');
const isAdmin = require('../middleware/adminMiddleware');
const Player = require('../models/Player');
const AuctionState = require('../models/AuctionState');

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

        const state = await AuctionState.findById('singleton');
        const fee = state?.captainFee || 0;

        if (fee > team.remainingPurse) {
            return res.status(400).json({ message: 'Team purse is insufficient for the captain fee' });
        }

        team.captain=req.user.id;
        team.remainingPurse-=fee;

        const captainPlayer = await Player.findOne({ user: req.user.id });
        if(captainPlayer && !team.players.includes(captainPlayer._id)){
            team.players.push(captainPlayer._id);
            captainPlayer.soldTo = team._id;
            captainPlayer.soldPrice = fee;
            captainPlayer.status = 'sold';
            await captainPlayer.save();
        }
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

router.put('/:id/rate', protect, isAdmin, async (req, res) => {
    try {
      const player = await Player.findById(req.params.id);
      if (!player) {
        return res.status(404).json({ message: 'Player not found' });
      }
  
      const rating = await getRating(player);
      const pool = ratingToPool(rating);
      const state = await AuctionState.findById('singleton');
  
      const poolPrices = {
        marquee: state?.marqueeBasePrice || 20000000,
        elite: state?.eliteBasePrice || 10000000,
        rookie: state?.rookieBasePrice || 5000000
      };
  
      player.overallRating = rating;
      player.pool = pool;
      player.basePrice = poolPrices[pool];
      await player.save();
  
      res.json(player);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

router.put('/:id/give-captaincy',protect,async (req,res)=>{
    try{
        const {playerId} = req.body;
        if(!playerId){
            return res.status(400).json({ message: 'playerId is required' });
        }
        const team = await Team.findById(req.params.id);
        if(!team){
            return res.status(404).json({ message: 'Team not found' });
        }
        if(team.captain.toString()!==req.user.id){
            return res.status(403).json({ message: 'Only the current captain can transfer captaincy' });
        }
        const isOnTeam = team.players.some((p)=>p.toString()===playerId);
        if(!isOnTeam){
            return res.status(400).json({ message: 'That player is not on your squad' });
        }
        const player = await Player.findById(playerId);
        if(!player || !player.user){
            return res.status(400).json({ message: 'This player has no linked user account' });
        }

        if (player.user.toString() === req.user.id) {
            return res.status(400).json({ message: 'You are already the captain' });
        }
        
        team.captain = player.user;
        await team.save();
        await User.findByIdAndUpdate(player.user, { role: 'captain', team: team._id });
        await User.findByIdAndUpdate(req.user.id, { team: null });

        res.json(team);
    }
    catch(err){
        res.status(500).json({message:err.message});
    }
})

module.exports = router;