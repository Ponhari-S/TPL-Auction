import { useState, useEffect } from 'react';
import socket from "../socket/socket";
import Header from "../components/Header";
import api from "../api/axios";
import { useSelector } from 'react-redux';

const AuctionPage = () => {
    const { user, token } = useSelector((state)=>state.auth);
    const [player, setPlayer] = useState("");
    const [currentBid, setCurrentBid] = useState(0);
    const [currentBidder, setCurrentBidder] = useState(null);
    const [minIncrement,setMinIncrement] = useState(5000000);
    const [myteam,setMyteam] = useState(null);
    const [bidError,setBidError] = useState("");
    const [squadSize,setSquadSize] = useState(6);

    useEffect(()=>{
      const fetchInfo = async () =>{
        try{
          const rulesRes = await api.get('auction/rules');
          setMinIncrement(rulesRes.data.minIncrement);

          if(user?.role==='captain'){
            const teamRes = await api.get('/teams');
            const team = teamRes.data.find((t)=> t.captain._id === user._id || t.captain===user._id);
            setMyteam(team||null);
          }
        }
        catch(err){
          console.error('Failed to fetch auction/team info', err);
        }
      }
      fetchInfo();
    },[user]);

    const nextValidBid = currentBid+minIncrement;
    const canBid = user?.role==='captain' && myteam && myteam.players.length < squadSize &&  myteam.remainingPurse >= nextValidBid;

    const handleBid = () =>{
      setBidError('');
      socket.emit('bid:place',{token,amount:nextValidBid});
    }

    useEffect(() => {
        socket.on('auction:playerUp', (data) => {
            setPlayer(data.player);
            setCurrentBid(data.currentBid);
            setCurrentBidder(null);
        });

        socket.on('auction:sync', (data) => {
            if (data.status === 'live') {
                setPlayer(data.player);
                setCurrentBid(data.currentBid);
                setCurrentBidder(data.currentBidder);
            }
        });

        socket.on('auction:bidUpdate', (data) => {
          setCurrentBid(data.currentBid);
          setCurrentBidder(data.currentBidder);
        });

        socket.on('bid:rejected',(data)=>{
          setBidError(data.message);
        })

        socket.emit('auction:requestSync');

        return () => {
            socket.off('auction:playerUp');
            socket.off('auction:sync');
            socket.off('auction:bidUpdate');
            socket.off('bid:rejected');
        };
    }, []);

  return (
    <div className="min-h-screen bg-[#0a0f1e]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&display=swap');
        .font-display { font-family: 'Oswald', sans-serif; }
      `}</style>
      <Header />
      <div className="p-6 max-w-2xl mx-auto">
        {!player ? (
          <div className="flex flex-col items-center justify-center gap-3 mt-16 px-4 py-10 rounded-2xl bg-[#0f1729] border border-white/10 border-dashed">
            <span className="w-2 h-2 rounded-full bg-slate-500" />
            <p className="text-slate-400 text-sm">No player currently up for auction.</p>
          </div>
        ) : (
          <div className="bg-[#0f1729] border border-white/10 rounded-2xl p-8 sm:p-10 text-center shadow-2xl shadow-black/40">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#22c55e]/30 bg-[#22c55e]/10 text-[#22c55e] text-xs tracking-widest uppercase font-display mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" />
              Live
            </span>

            <h1 className="font-display text-3xl sm:text-4xl text-white tracking-tight mb-2">{player.name}</h1>
            <p className="text-slate-400 capitalize mb-1">{player.role}</p>
            {player.pool && (
              <span className="inline-block bg-[#f4b942]/10 border border-[#f4b942]/30 text-[#f4b942] text-xs px-3 py-1 rounded-full capitalize mt-2 tracking-wide">
                {player.pool}
              </span>
            )}

            <div className="mt-6 bg-[#f4b942]/5 border border-[#f4b942]/20 rounded-xl p-6">
              <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Current Bid</p>
              <p className="font-display text-4xl text-[#f4b942] tabular-nums">₹{currentBid.toLocaleString()}</p>
              <p className="text-slate-400 text-sm mt-3">
                {currentBidder ? (
                  <>Leading: <span className="text-white font-semibold">{currentBidder.name}</span></>
                ) : (
                  'No bids yet'
                )}
              </p>
            </div>

            {user?.role === 'captain' && (
              <div className="mt-4">
                {bidError && <p className="text-red-400 text-sm mb-2">{bidError}</p>}
                <button
                  onClick={handleBid}
                  disabled={!canBid}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg text-lg"
                >
                Bid ₹{nextValidBid.toLocaleString()}
                </button>
                {myteam && myteam.players.length >= squadSize && (
                  <p className="text-slate-500 text-xs mt-2 text-center">Your squad is full</p>
                )}
                {myteam && myteam.remainingPurse < nextValidBid && (
                  <p className="text-slate-500 text-xs mt-2 text-center">Insufficient purse for next bid</p>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-8 text-left">
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Matches</p>
                <p className="font-display text-xl text-white tabular-nums">{player.stats.matches}</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Runs</p>
                <p className="font-display text-xl text-white tabular-nums">{player.stats.runs}</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Wickets</p>
                <p className="font-display text-xl text-white tabular-nums">{player.stats.wickets}</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Average</p>
                <p className="font-display text-xl text-[#f4b942] tabular-nums">{player.stats.average}</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Strike Rate</p>
                <p className="font-display text-xl text-white tabular-nums">{player.stats.strikeRate}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AuctionPage;