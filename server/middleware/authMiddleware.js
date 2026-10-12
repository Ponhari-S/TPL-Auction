const jwt=require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req,res,next)=>{
    const authHeader = req.headers.authorization;
    if(!authHeader || !authHeader.startsWith('Bearer ')){
        return res.status(401).json({message:"You are not authorized"});
    }

    const token=authHeader.split(" ")[1];

    let decoded;
    try{
        decoded=jwt.verify(token,process.env.JWT_SECRET);
    }
    catch(err){
        return res.status(401).json({ message: 'Session expired, please log in again' });
    }

    let user;
    try {
        user = await User.findById(decoded.id).select('role');
    } catch (err) {
        return res.status(500).json({ message: 'Could not verify session' });
    }

    if (!user) {
        return res.status(401).json({ message: 'User no longer exists' });
    }
    req.user = { id: user._id.toString(), role: user.role };
    next();
}

module.exports=protect;