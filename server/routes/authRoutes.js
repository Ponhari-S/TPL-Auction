const express=require('express');
const bcrypt=require('bcryptjs');
const User=require('../models/User');
const jwt=require('jsonwebtoken');

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

router.post('/login',async (req,res)=>{
    try{const {email,password} = req.body;

    const user= await User.findOne({email});
    if(!user){
        return res.status(401).json({message:"Invalid username or password"});
    }

    const matchedUser= await bcrypt.compare(password,user.password);
    if(!matchedUser){
        return res.status(401).json({message:"Invalid username or password"}); 
    }

    const token = jwt.sign(
        {id: user._id , role:user.role},
        process.env.JWT_SECRET,
        {expiresIn: '7d'}
    )

    res.json({
        token,
        user: {
            _id:user._id,
            name: user.name,
            email: user.email,
            role: user.role
        }
    })}
    catch(err){
        res.status(500).json({message: err.message});
    }
})

module.exports= router