import { useState, useEffect } from 'react';
import socket from '../socket/socket';
import { useSelector } from 'react-redux';

const SocketTest = () => {
  const {token} = useSelector((state) => state.auth);
  const [bidReject, setBidReject] = useState("");
  const [bidAmount, setBidAmount] = useState("");
  const [connected, setConnected] = useState(false);
  const [response, setResponse] = useState("");

  useEffect(() => {
    socket.on('connect', () => {
      setConnected(true);
    });

    socket.on('pong-test', (data) => {
      setResponse(data);
    });

    socket.on('auction:playerUp', (data) => {
      console.log('Player up:', data);
    })

    socket.on('bid:rejected', (data) => {
      setBidReject(data.message);
    })

    socket.on('auction:bidUpdate', (data) => {
      console.log('Bid update: ', data);
    });

    socket.on('auction:playerSold',(data)=>{
      console.log('Player Sold: ', data);
    });

    socket.on('auction:playerUnsold',(data)=>{
      console.log("Player Unsold: ",data);
    });

    socket.on('auction:playerUnsoldFinal',(data)=>{
      console.log("Player Unsold Final: ",data);
    });

    socket.on('auction:sync',(data)=>{
      console.log("Synced",data);
    })

    return () => {
      socket.off('connect');
      socket.off('pong-test');
      socket.off('auction:playerUp');
      socket.off('bid:rejected');
      socket.off('auction:bidUpdate');
      socket.off('auction:playerSold');
      socket.off('auction:playerUnsold');
      socket.off('auction:playerUnsoldFinal');
      socket.off('auction:sync');
    }
  }, []);

  const setPing = () => {
    socket.emit('ping-test');
  }

  const sendBid = () => {
    setBidReject('');
    socket.emit('bid:place', { token, amount: Number(bidAmount) });
  }

  return (
    <div className="bg-[#0f1729] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/40">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&display=swap');
        .font-display { font-family: 'Oswald', sans-serif; }
      `}</style>

      <div className="flex items-center justify-between gap-4 mb-6">
        <h2 className="font-display text-2xl text-white tracking-tight">Socket Test</h2>
        <span className={`px-3 py-1 rounded-full border text-xs uppercase tracking-wider whitespace-nowrap flex items-center gap-1.5 ${
          connected
            ? "bg-[#22c55e]/15 text-[#22c55e] border-[#22c55e]/30"
            : "bg-red-500/15 text-red-400 border-red-500/30"
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-[#22c55e] animate-pulse' : 'bg-red-400'}`} />
          {connected ? 'Connected' : 'Disconnected'}
        </span>
      </div>

      <button
        onClick={setPing}
        className="bg-[#f4b942] hover:bg-[#e5aa2f] text-[#0a0f1e] font-display font-semibold text-sm tracking-wide px-5 py-2.5 rounded-lg transition-colors"
      >
        Send Ping
      </button>

      {response && (
        <div className="mt-4 px-4 py-3 rounded-lg bg-white/5 border border-white/10">
          <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Server Response</p>
          <p className="text-slate-200 text-sm font-display tracking-wide">{response}</p>
        </div>
      )}
    </div>
  )
}

export default SocketTest;