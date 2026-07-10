const isAdmin = (req,res,next) => {
    if(req.user && req.user.role === 'admin'){
        next();
    }
    else{
        res.status(403).json({message:"You are not authorized as admin"});
    }
}

module.exports = isAdmin;