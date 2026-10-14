const express=require('express');
const bcrypt=require('bcryptjs');
const User=require('../models/User');
const jwt=require('jsonwebtoken');
const protect = require('../middleware/authMiddleware');
const isAdmin = require('../middleware/adminMiddleware');
const {loginLimit,signupLimit,forgotEmailLimit,forgotIpLimit} = require('../middleware/rateLimiters');
const crypto = require('crypto');
const {sendResetEmail} = require('../utils/mailer');

const router=express.Router();
const SIGNUP_ROLES = ['player','captain'];

router.get('/me',protect,async (req,res)=>{
    try{
        const user= await User.findById(req.user.id).select('-password -resetPasswordToken -resetPasswordExpires');
        if(!user){
            return res.status(404).json({message:'User not found'});
        }
        res.json(user);
    }
    catch(err){
        res.status(500).json({message:err.message});
    }
});

router.post('/signup',signupLimit,async (req,res)=>{
    try{
        const {name, stumpsId, email, password, role} = req.body;

        if(!name || !stumpsId || !email || !password){
            return res.status(400).json({message:"All fields are required"});
        }

        const existingUser = await User.findOne({$or: [{email}, {stumpsId}]});
        if(existingUser){
            return res.status(400).json({message:"Stumps ID or Email Already Exists"});
        }

        const salt=await bcrypt.genSalt(10);
        const hashedPassword=await bcrypt.hash(password,salt);

        const safeRole = SIGNUP_ROLES.includes(role) ? role : 'player';
        
        const user= await User.create({
            name,
            stumpsId,
            email,
            password: hashedPassword,
            role: safeRole
        });

        res.status(200).json({
            _id:user._id,
            name:user.name,
            stumpsId:user.stumpsId,
            email:user.email,
            role:user.role
        });
    }
    catch(err){
        res.status(500).json({message:err.message});
    }
})

router.post('/login',loginLimit,async (req,res)=>{
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
            role: user.role,
            team: user.team
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

router.post('/forgot-password',forgotEmailLimit,forgotIpLimit, async (req, res) => {
    const genericMessage = 'If that email is registered, a reset link has been sent';
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({
                message: 'Email is required'
            });
        }
        const user = await User.findOne({ email });
        if (user) {
            const token = crypto.randomBytes(32).toString('hex');
            user.resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');
            user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);
            await user.save();

            const resetUrl = `${process.env.CLIENT_URL}/reset-password/${token}`;
            await sendResetEmail(user.email, resetUrl).catch((mailErr) => {
                console.error('Reset email failed:', mailErr.message);
            });
        }
        return res.json({
            message: genericMessage
        });

    } catch (err) {
        console.error('Forgot password error:', err.message);
        return res.json({ message: genericMessage });
    }
});

router.post('/reset-password/:token',async (req,res)=>{
    try{
        const {password} =req.body;
        if (!password) {
            return res.status(400).json({ message: 'Password is required' });
        }
        const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
        const user = await User.findOne({
            resetPasswordToken:hashedToken,
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