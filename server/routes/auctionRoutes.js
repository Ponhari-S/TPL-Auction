const AuctionState = require('../models/AuctionState');
const protect = require('../middleware/authMiddleware');
const isAdmin = require('../middleware/adminMiddleware');
const express = require('express');

const router = express.Router();

const getOrCreateAuctionState = async () =>{
    const state=await AuctionState.findOne();
    if(!state){
        state=await AuctionState.create({});
    }
    return state;
};

router.get('/rules',protect,async (req,res)=>{
    try{
        const state=await getOrCreateAuctionState();
        res.json(state);
    }
    catch(err){
        res.status(500).json({ message: err.message });
    }
});

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