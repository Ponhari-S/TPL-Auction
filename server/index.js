const express= require('express');
const cors=require('cors');
require('dotenv').config();
const { connectDB } = require('./config/db');
const authRoutes = require('./routes/authRoutes');

connectDB();

const app=express();
app.use(express.json());
app.use(cors());

app.use('/api/auth',authRoutes);

app.get('/',(req,res)=>{
    res.send("Auction API is running");
})

const PORT=process.env.PORT;

app.listen(PORT,()=>{
    console.log(`Server is running in port ${PORT}`);
})