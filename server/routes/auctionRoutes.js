const AuctionState = require('../models/AuctionState');
const protect = require('../middleware/authMiddleware');
const isAdmin = require('../middleware/adminMiddleware');
const express = require('express');
const Player = require('../models/Player');
const { startNextPlayer } = require('../auction/engine');

const router = express.Router();

let getOrCreateAuctionState = async () =>{
    let state = await AuctionState.findById('singleton');
    if (!state) {
      state = await AuctionState.create({ _id: 'singleton' });
    }
    return state;
};

const shuffleArray = (array) => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
};

router.get('/rules',protect,async (req,res)=>{
    try{
        let state=await getOrCreateAuctionState();
        res.json(state);
    }
    catch(err){
        res.status(500).json({ message: err.message });
    }
});

router.post('/build-queue',protect,isAdmin,async (req,res)=>{
    try{
        let state= await getOrCreateAuctionState();
        if (state.status === 'live' || state.status === 'paused') {
            return res.status(400).json({ message: 'Cannot rebuild queue while auction is in progress' });
        }
        const pools = { marquee: [], elite: [], rookie: [], unrated: [] };
        const eligiblePlayer = await Player.find({status:"registered"});
        eligiblePlayer.forEach((player) => {
            const key = pools[player.pool] ? player.pool : 'unrated';
            pools[key].push(player);
        });
        const finalQueue=[
            ...shuffleArray(pools.marquee),
            ...shuffleArray(pools.elite),
            ...shuffleArray(pools.rookie),
            ...shuffleArray(pools.unrated)
        ]
        state.playerQueue=finalQueue.map((p)=>p._id);
        await state.save();
        res.json({ message: `Queue built with ${finalQueue.length} players`, queue: state.playerQueue });
    }catch(err){
        res.status(500).json({ message: err.message });
    }
});

router.put('/start',async (req,res)=>{
    try{
        let state = await getOrCreateAuctionState();

        if(!state.playerQueue || state.playerQueue.length===0){
            return res.status(400).json({ message: 'Build the queue before starting the auction' });
        }

        state.status='live';
        await state.save();

        await startNextPlayer();
        
        res.json(state);
    }
    catch(err){
        res.status(500).json({ message: err.message });
    }
});

router.put('/pause',async (req,res)=>{
    try{
        let state=await getOrCreateAuctionState();
        if(state.status!=='live'){
            return res.status(400).json({ message: 'Auction is not currently live' });
        }
        state.status='paused';
        await state.save();
        res.json(state);
    }
    catch(err){
        res.status(500).json({ message: err.message });
    }
});

router.put('/resume',async (req,res)=>{
    try{
        let state=await getOrCreateAuctionState();
        if(state.status!=='paused'){
            return res.status(400).json({ message: 'Auction is not currently paused' });
        }
        state.status='live';
        await state.save();
        res.json(state);
    }
    catch(err){
        res.status(500).json({ message: err.message });
    }
});

router.get('/status',async(req,res)=>{
    try{
        let state=await getOrCreateAuctionState();
        res.json({status:state.status});
    }
    catch(err){
        res.status(500).json({ message: err.message });
    }
})

router.put('/rules',protect,isAdmin,async (req,res)=>{
    try{
        const{minIncrement,squadSize,maxRetentions,minRetentionPrice,maxRetentionPrice}=req.body;
        const state=await getOrCreateAuctionState();

        if(minIncrement!==undefined){
            state.minIncrement=minIncrement;
        }
        if(squadSize!==undefined){
            state.squadSize=squadSize;
        }
        if(maxRetentions!==undefined){
            state.maxRetentions=maxRetentions;
        }
        if(minRetentionPrice!==undefined){
            state.minRetentionPrice=minRetentionPrice;
        }
        if(maxRetentionPrice!==undefined){
            state.maxRetentionPrice=maxRetentionPrice;
        }

        await state.save();
        res.json(state);
    }
    catch(err){
        res.status(500).json({ message: err.message });
    }
});

module.exports=router;