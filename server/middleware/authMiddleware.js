const jwt=require('jsonwebtoken');

const protect = (req,res,next)=>{
    const authHeader = req.headers.authorization;
    if(!authHeader || !authHeader.startsWith('Bearer ')){
        res.status(401).json({message:"You are not authorized"});
    }

    const token=authHeader.split(" ")[1];

    try{
        const decoded=jwt.verify(token,process.env.JWT_SECRET);
        req.user=decoded;
        next();
    }
    catch(err){
        res.status(500).json({message:err.message});
    }
}

module.exports=protect;