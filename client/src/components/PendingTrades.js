import { useEffect, useState } from 'react';
import api from '../api/axios';

const PendingTrades = () => {
    const [trades, setTrades] = useState([]);
    const [error, setError] = useState("");

    const fetchTrade = async () => {
        try {
            const res = await api.get('/trades/pending-request');
            setTrades(res.data);
        }
        catch (err) {
            console.log(err);
        }
    }

    useEffect(() => {
        fetchTrade();
    }, [])

    const handleApprove = async (id) => {
        setError("");
        try {
            await api.put(`/trades/${id}/approve`);
            fetchTrade();
        }
        catch (err) {
            setError(err.response?.data?.message || 'Failed to approve trade');
        }
    }
    if (trades.length === 0) return null;

  return (
    <div className="bg-[#0f1729] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/40">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&display=swap');
        .font-display { font-family: 'Oswald', sans-serif; }
      `}</style>

      <h2 className="font-display text-2xl text-white tracking-tight mb-6">Trades Awaiting Approval</h2>

      {error && (
        <div className="mb-5 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-3">
        {trades.map((t) => (
          <div key={t._id} className="bg-white/5 border border-white/10 rounded-lg p-4">
            <p className="text-white text-sm font-semibold">
              {t.fromTeam.name} <span className="text-slate-500 font-normal">↔</span> {t.toTeam.name}
            </p>
            <p className="text-slate-400 text-xs mt-2">
              {t.fromTeam.name} gets: <span className="text-[#f4b942]">{t.requestedPlayer.name}</span>
            </p>
            <p className="text-slate-400 text-xs">
              {t.toTeam.name} gets:{' '}
              <span className="text-[#f4b942]">
                {t.offeredPlayer ? t.offeredPlayer.name : ''}
                {t.offeredPlayer && t.offeredPurse > 0 && ' + '}
                {t.offeredPurse > 0 && `₹${t.offeredPurse.toLocaleString()}`}
              </span>
            </p>
            <button
              onClick={() => handleApprove(t._id)}
              className="mt-3 bg-[#f4b942] hover:bg-[#e5aa2f] text-[#0a0f1e] text-xs font-display font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              Approve Trade
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default PendingTrades;