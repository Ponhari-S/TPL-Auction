const express= require('express');
const cors=require('cors');
require('dotenv').config();
const { connectDB } = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const protect=require('./middleware/authMiddleware');

connectDB();

const app=express();
app.use(express.json());
app.use(cors());

app.use('/api/auth',authRoutes);

app.get('/api/test-protected',protect,(req,res)=>{
    res.status(200).json({message:"You are Authorized!!",user:req.user});
})

app.get('/',(req,res)=>{
    res.send("Auction API is running");
})

const PORT=process.env.PORT;

app.listen(PORT,()=>{
    console.log(`Server is running in port ${PORT}`);
})