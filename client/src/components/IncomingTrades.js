import { useEffect, useState } from "react";
import api from "../api/axios";

const IncomingTrades = () => {
    const [trades, setTrades] = useState([]);

    const fetchTrades = async () => {
        try {
            const res = await api.get('/trades/incoming');
            setTrades(res.data);
        }
        catch (err) {

        }
    }
    useEffect(() => {
        fetchTrades();
    }, []);

    if (trades.length === 0) return null;

  return (
    <div className="bg-[#0f1729] border border-[#f4b942]/30 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/40">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&display=swap');
        .font-display { font-family: 'Oswald', sans-serif; }
      `}</style>

      <h2 className="font-display text-2xl text-white tracking-tight mb-6">
        Incoming Trade Requests <span className="text-[#f4b942]">({trades.length})</span>
      </h2>

      <div className="flex flex-col gap-3">
        {trades.map((trade) => (
          <div key={trade._id} className="bg-white/5 border border-white/10 rounded-lg p-4">
            <p className="text-white text-sm">
              <span className="font-semibold">{trade.fromTeam.name}</span> wants{' '}
              <span className="text-[#f4b942]">{trade.requestedPlayer.name}</span>
            </p>
            <p className="text-slate-400 text-xs mt-1">
                Offering: {trade.offeredPlayer ? trade.offeredPlayer.name : ''}
                {trade.offeredPlayer && trade.offeredPurse > 0 && ' + '}
                {trade.offeredPurse > 0 && `₹${trade.offeredPurse.toLocaleString()}`}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default IncomingTrades;