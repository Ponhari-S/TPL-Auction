const AuctionState = require('../models/AuctionState');
const protect = require('../middleware/authMiddleware');
const isAdmin = require('../middleware/adminMiddleware');
const express = requite('express');

const router = express.Router();

module.exports=router;