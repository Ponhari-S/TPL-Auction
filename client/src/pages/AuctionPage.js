import { useState, useEffect } from 'react';
import socket from "../socket/socket";
import Header from "../components/Header";

const AuctionPage = () => {
    const [player, setPlayer] = useState("");
    const [currentBid, setCurrentBid] = useState(0);

    useEffect(() => {
        socket.on('auction:playerUp', (data) => {
            setPlayer(data.player);
            setCurrentBid(data.currentBid);
        });

        socket.on('auction:sync', (data) => {
            if (data.status === 'live') {
                setPlayer(data.player);
                setCurrentBid(data.currentBid);
            }
        });

        socket.emit('auction:requestSync');

        return () => {
            socket.off('auction:playerUp');
            socket.off('auction:sync');
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

export default AuctionPage