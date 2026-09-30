const express=require('express');
const bcrypt=require('bcryptjs');
const User=require('../models/User');
const jwt=require('jsonwebtoken');
const protect = require('../middleware/authMiddleware');
const isAdmin = require('../middleware/adminMiddleware');
const {authLimit} = require('../middleware/rateLimiters');
const crypto = require('crypto');
const {sendResetEmail} = require('../utils/mailer');

const router=express.Router();

router.get('/me',protect,async (req,res)=>{
    try{
        const user= await User.findById(req.user.id).select('-password');
        if(!user){
            return res.status(404).json({message:'User not found'});
        }
        res.json(user);
    }
    catch(err){
        res.status(500).json({messsge:err.message});
    }
});

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
});

router.get('/unlinked-users', protect, isAdmin, async (req, res) => {
    try {
      const Player = require('../models/Player');
      const linkedUserIds = await Player.find({ user: { $ne: null } }).distinct('user');
      const users = await User.find({
        role: { $in: ['player', 'captain'] },
        _id: { $nin: linkedUserIds }
      }).select('name email role');
      res.json(users);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
});

router.post('/forgot-password', authLimit, async (req, res) => {

    console.log('\n========== FORGOT PASSWORD REQUEST ==========');

    try {

        console.log('Request body:', req.body);

        const { email } = req.body;

        console.log('Email received:', email);

        if (!email) {
            console.log('❌ Email missing');

            return res.status(400).json({
                message: 'Email is required'
            });
        }

        console.log('Searching user...');

        const user = await User.findOne({ email });

        console.log('User found:', !!user);

        if (!user) {

            console.log('⚠️ User does not exist');

            return res.json({
                message: 'If that email exists, a reset link has been sent'
            });
        }

        console.log('Generating reset token...');

        const token = crypto.randomBytes(32).toString('hex');

        user.resetPasswordToken = token;

        user.resetPasswordExpires =
            new Date(Date.now() + 15 * 60 * 1000);

        await user.save();

        console.log('✅ Reset token saved');

        const resetUrl =
            `${process.env.CLIENT_URL}/reset-password/${token}`;

        console.log('CLIENT_URL:', process.env.CLIENT_URL);
        console.log('Reset URL:', resetUrl);

        console.log('Calling sendResetEmail()...');

        await sendResetEmail(user.email, resetUrl);

        console.log('✅ sendResetEmail completed');

        console.log('Sending success response...');

        return res.json({
            message: 'A reset link has been sent'
        });

    } catch (err) {

        console.error('❌ FORGOT PASSWORD ERROR');
        console.error('Message:', err.message);
        console.error('Code:', err.code);
        console.error('Full error:', err);

        return res.status(500).json({
            message: err.message
        });
    }
});

router.post('/reset-password/:token',async (req,res)=>{
    try{
        const {password} =req.body;
        const user = await User.findOne({
            resetPasswordToken:req.params.token,
            resetPasswordExpires: {$gt: Date.now()}
        });

        if(!user){
            return res.status(400).json({ message: 'Reset link is invalid or has expired' });
        }

        const salt = await bcrypt.genSalt(10);
        user.password=await bcrypt.hash(password,salt);
        user.resetPasswordToken=null,
        user.resetPasswordExpires=null
        await user.save();

        res.json({ message: 'Password reset successfully' });
    }
    catch(err){
        res.status(500).json({ message: err.message });
    }
})

module.exports= router