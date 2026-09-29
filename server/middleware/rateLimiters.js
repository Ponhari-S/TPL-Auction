const rateLimit = require("express-rate-limit");

const authLimit = rateLimit({
    windowMs: 15*60*1000,
    max: 5,
    message: { message: 'Too many attempts, please try again in 15 minutes' },
    standardHeaders: true,
    legacyHeaders: false
})

module.exports={authLimit};