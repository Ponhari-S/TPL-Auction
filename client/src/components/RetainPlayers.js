import { useEffect, useState } from 'react';
import api from "../api/axios";

const RetainPlayers = () => {
    const [players, setPlayers] = useState("");
    const [prices, setPrices] = useState("");
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const fetchPlayers = async () => {
        try {
            const player = await api.get("/players");
            setPlayers(player.data.filter((p) => !p.retainedBy && p.status !== 'sold'));
        }
        catch (err) {
            setError('Failed to load players');
        }
    };

    useEffect(() => {
        fetchPlayers();
    }, []);

    const handleRetain = async (playerId) => {
        setMessage("");
        setError("");
        const price = Number(prices[playerId]);
        try {
            await api.put(`/players/${playerId}/retain`, { price });
            setMessage("Player retained successfully");
            fetchPlayers();
        }
        catch (err) {
            setError(err.response?.data?.message || 'Failed to retain player');
        }
    };

  return (
    <div className="bg-[#0f1729] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/40">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&display=swap');
        .font-display { font-family: 'Oswald', sans-serif; }
      `}</style>

      <h2 className="font-display text-2xl text-white tracking-tight mb-1">Retain Players</h2>
      <p className="text-slate-500 text-sm mb-6">Lock in players before the auction begins.</p>

      {message && (
        <div className="mb-5 px-4 py-3 rounded-lg bg-[#22c55e]/10 border border-[#22c55e]/30 text-[#22c55e] text-sm">
          {message}
        </div>
      )}
      {error && (
        <div className="mb-5 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {error}
        </div>
      )}

      {players.length === 0 && (
        <div className="flex items-center gap-3 px-4 py-6 rounded-lg bg-white/5 border border-white/10 border-dashed justify-center">
          <p className="text-slate-500 text-sm">No players available to retain.</p>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {players.length > 0 && players.map((player) => (
          <div
            key={player._id}
            className="flex flex-col sm:flex-row sm:items-center gap-3 bg-white/5 border border-white/10 p-4 rounded-xl"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <span className="shrink-0 w-9 h-9 rounded-full bg-[#f4b942]/15 text-[#f4b942] font-display font-semibold text-sm flex items-center justify-center">
                {player.name?.charAt(0).toUpperCase()}
              </span>
              <span className="text-white text-sm truncate">
                {player.name} <span className="text-slate-500 capitalize">({player.role})</span>
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <input
                type="number"
                placeholder="Price"
                value={prices[player._id] || ''}
                onChange={(e) => setPrices({ ...prices, [player._id]: e.target.value })}
                className="w-28 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-slate-600 outline-none focus:border-[#f4b942] focus:ring-1 focus:ring-[#f4b942] transition-colors text-sm"
              />
              <button
                onClick={() => handleRetain(player._id)}
                className="bg-[#f4b942] hover:bg-[#e5aa2f] text-[#0a0f1e] font-display font-semibold text-sm px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
              >
                Retain
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default RetainPlayers