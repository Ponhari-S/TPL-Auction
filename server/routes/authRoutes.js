const express=require('express');
const bcrypt=require('bcryptjs');
const User=require('../models/User');

const router=express.Router();

router.post('/signup',async (req,res)=>{
    try{
        const {name, stumpsId, email, password, role} = req.body;

        const existingUser = await User.findOne({$or: [{email}, {stumpsId}]});
        if(existingUser){
            return res.status(400).json({message:"Stumps ID or Email Already Exists"});
        }

        const salt=await bcrypt.genSalt(10);
        const hashedPassword=await bcrypt.hash(password,salt);

        const user= await User.create({
            name,
            stumpsId,
            email,
            password: hashedPassword,
            role
        });

        res.status(200).json({
            _id:user._id,
            name:user.name,
            stumpsId:user.stumpsId,
            email:user.email,
            password:user.password,
            role:user.role
        });
    }
    catch(err){
        res.status(500).json({messsge:err.message});
    }
})

module.exports= router