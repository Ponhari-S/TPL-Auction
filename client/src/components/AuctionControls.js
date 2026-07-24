import { useState, useEffect } from 'react';
import api from '../api/axios';
import socket from "../socket/socket";

const AuctionControls = () => {
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await api.get('/auction/status');
        setStatus(res.data.status);
      }
      catch (err) {
       setError('Failed to load auction status');
      }
    };

    fetchStatus();
  }, []);

  useEffect(()=>{
    socket.on('auction:ended',()=>{
      setStatus('ended');
    })

    return () => {
      socket.off('auction:ended');
    };
  },[]);
  
  const handleAction = async (action) => {
    try {
      const res = await api.put(`/auction/${action}`);
      setStatus(res.data.status);
    }
    catch (err) {
      setError(err.response?.data?.message || `Failed to ${action} auction`);
    }
  }

  const statusStyles = {
    'not-started': "bg-white/5 text-slate-300 border-white/10",
    live: "bg-[#22c55e]/15 text-[#22c55e] border-[#22c55e]/30",
    paused: "bg-[#f4b942]/15 text-[#f4b942] border-[#f4b942]/30"
  };

  if (!status) {
    return (
      <div className="bg-[#0f1729] border border-white/10 rounded-2xl p-6 flex items-center gap-3">
        <span className="w-2 h-2 rounded-full bg-[#f4b942] animate-pulse" />
        <p className="text-slate-400 text-sm">Loading auction status...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#0f1729] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/40">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&display=swap');
        .font-display { font-family: 'Oswald', sans-serif; }
      `}</style>

      <div className="flex items-center justify-between gap-4 mb-6">
        <h2 className="font-display text-2xl text-white tracking-tight">Auction Controls</h2>
        <span className={`px-3 py-1 rounded-full border text-xs uppercase tracking-wider capitalize whitespace-nowrap flex items-center gap-1.5 ${statusStyles[status] || "bg-white/5 text-slate-300 border-white/10"}`}>
          {status === 'live' && <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" />}
          {status}
        </span>
      </div>

      {error && (
        <div className="mb-5 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        {(status === 'not-started' || status==='ended') && (
          <button
            onClick={() => handleAction('start')}
            className="bg-[#22c55e] hover:bg-[#1ea34e] text-[#0a0f1e] font-display font-semibold text-sm tracking-wide px-5 py-2.5 rounded-lg transition-colors"
          >
            Start Auction
          </button>
        )}

        {status === 'live' && (
          <button
            onClick={() => handleAction('pause')}
            className="bg-[#f4b942] hover:bg-[#e5aa2f] text-[#0a0f1e] font-display font-semibold text-sm tracking-wide px-5 py-2.5 rounded-lg transition-colors"
          >
            Pause Auction
          </button>
        )}

        {status === 'paused' && (
          <button
            onClick={() => handleAction('resume')}
            className="bg-[#22c55e] hover:bg-[#1ea34e] text-[#0a0f1e] font-display font-semibold text-sm tracking-wide px-5 py-2.5 rounded-lg transition-colors"
          >
            Resume Auction
          </button>
        )}
      </div>
    </div>
  )
}

export default AuctionControls;