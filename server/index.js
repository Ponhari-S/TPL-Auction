const express= require('express');
const cors=require('cors');
require('dotenv').config();
const { connectDB } = require('./config/db');
const { Server } = require('socket.io');
const http = require('http');
const {initEngine} = require('./auction/engine');
const jwt = require('jsonwebtoken');
const Team = require('./models/Team');
const AuctionState = require('./models/AuctionState');
const { placeBid } = require('./auction/engine');

const authRoutes = require('./routes/authRoutes');
const protect=require('./middleware/authMiddleware');
const playerRoutes=require('./routes/playerRoutes');
const teamRoutes=require('./routes/teamRoutes');
const auctionRoutes = require('./routes/auctionRoutes');
const Player = require('./models/Player');

connectDB();

const app=express();
app.use(express.json());
app.use(cors());

app.use('/api/auth',authRoutes);
app.use('/api/players',playerRoutes);
app.use('/api/teams',teamRoutes);
app.use('/api/auction',auctionRoutes);

app.get('/api/test-protected',protect,(req,res)=>{
    res.status(200).json({message:"You are Authorized!!",user:req.user});
})

app.get('/',(req,res)=>{
    res.send("Auction API is running");
})

const server=http.createServer(app);

const io = new Server(server,{
    cors:{
        origin: 'http://localhost:3000',
        methods: ['GET','POST']
    }
});

initEngine(io);

io.on('connection',async (socket)=>{
    console.log('Client connected:', socket.id);

    try{
        const state=await AuctionState.findById('singleton');
        if(state && state.status=='live' && state.currentPlayer){
            const player = await Player.findById(state.currentPlayer);
            socket.emit('auction:sync',{
                status:state.status,
                player,
                currentBid: state.currentBid,
                currentBidder: state.currentBidder,
                timerEndsAt: state.timerEndsAt
            });
        }
    }
    catch(err){
        console.error('Sync on connect failed:', err.message);
    }

    socket.on('ping-test',()=>{
        socket.emit('pong-test', 'Hello from server');
    });

    socket.on('bid:place', async ({token,amount})=>{
        try{
            const decoded=jwt.verify(token,process.env.JWT_SECRET);
            const result=await placeBid(decoded.id,amount);
            if(!result.success){
                socket.emit('bid:rejected',{ message: result.message });
            }
        }
        catch(err){
            socket.emit('bid:rejected',{message: 'Invalid or expired session'});
        }
    })

    socket.on('disconnect',()=>{
        console.log('Client disconnected:', socket.id)
    });

});

const PORT=process.env.PORT;

server.listen(PORT,()=>{
    console.log(`Server is running in port ${PORT}`);
})