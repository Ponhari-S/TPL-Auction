const express= require('express');
const cors=require('cors');
require('dotenv').config();
const { connectDB } = require('./config/db');
const { Server } = require('socket.io');
const http = require('http');

const authRoutes = require('./routes/authRoutes');
const protect=require('./middleware/authMiddleware');
const playerRoutes=require('./routes/playerRoutes');
const teamRoutes=require('./routes/teamRoutes');
const auctionRoutes = require('./routes/auctionRoutes');

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

io.on('connection',(socket)=>{
    console.log('Client connected:', socket.id);

    socket.on('ping-test',()=>{
        socket.emit('pong-test', 'Hello from server');
    });

    socket.on('disconnect',()=>{
        console.log('Client disconnected:', socket.id)
    });

});

const PORT=process.env.PORT;

server.listen(PORT,()=>{
    console.log(`Server is running in port ${PORT}`);
})