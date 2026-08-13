const express = require('express');
const Team = require('../models/Team');
const Trade = require('../models/Trade');
const protect = require('../middleware/authMiddleware');

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
})

module.exports = router;