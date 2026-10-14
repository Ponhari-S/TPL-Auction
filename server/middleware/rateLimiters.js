const { rateLimit, ipKeyGenerator } = require("express-rate-limit");

const emailKey = (req) => {
    return `${ipKeyGenerator(req.ip)}|${String(req.body?.email || '').trim().toLowerCase()}`;
}

const windowMs = 15*60*1000;

const loginLimit = rateLimit({
    windowMs,
    limit: 10,
    skipSuccessfulRequests: true,
    keyGenerator: emailKey,
    standardHeaders: true,
    legacyHeaders: false,
    message: {message: 'Too many failed login attempts, please try again in 15 minutes'}
});

const signupLimit = rateLimit({
    windowMs,
    limit: 10,
    skipSuccessfulRequests: true,
    keyGenerator: emailKey,
    standardHeaders: true,
    legacyHeaders: false,
    message: {message: 'Too many failed signup attempts, please try again in 15 minutes'}
});

const forgotEmailLimit = rateLimit({
    windowMs,
    limit: 5,
    keyGenerator: emailKey,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many reset requests for this email, please try again in 15 minutes' }
});

const forgotIpLimit = rateLimit({
    windowMs,
    limit: 60,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many reset requests, please try again later' }
});

module.exports={loginLimit,signupLimit,forgotEmailLimit,forgotIpLimit};