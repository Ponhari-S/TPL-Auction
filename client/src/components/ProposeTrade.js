import { useEffect, useState } from "react";
import api from "../api/axios";

const ProposeTrade = ({ myTeam }) => {
    const [teams, setTeams] = useState([]);
    const [toTeamId, setToTeamId] = useState("");
    const [offeredPlayerId, setOfferedPlayerId] = useState("");
    const [offeredPurse, setOfferedPurse] = useState("");
    const [requestedPlayerId, setRequestedPlayerId] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        api.get('/teams').then((res) => {
            setTeams(res.data.filter((p) => p._id !== myTeam?._id));
        })
    }, [myTeam]);

    const targetTeam = teams.find((p) => p._id === toTeamId);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");
        try {
            await api.post('/trades', {
                toTeamId,
                offeredPlayerId: offeredPlayerId || null,
                offeredPurse: offeredPurse ? Number(offeredPurse) : 0,
                requestedPlayerId: requestedPlayerId
            });
            setMessage("Trade Request Sent");
            setToTeamId("");
            setOfferedPlayerId("");
            setOfferedPurse("");
            setRequestedPlayerId("");
        }
        catch (err) {
            setError(err.response?.data?.message || 'Failed to send trade request');
        }
    }

  return (
    <div className="bg-[#0f1729] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/40">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&display=swap');
        .font-display { font-family: 'Oswald', sans-serif; }
      `}</style>

      <h2 className="font-display text-2xl text-white tracking-tight mb-1">Propose a Trade</h2>
      <p className="text-slate-500 text-sm mb-6">Offer a player or purse in exchange for someone on another squad.</p>

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

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="text-xs text-slate-400 uppercase tracking-wider mb-1.5 block">Trade With</label>
          <select
            value={toTeamId}
            onChange={(e) => { setToTeamId(e.target.value); setRequestedPlayerId(''); }}
            className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white outline-none focus:border-[#f4b942] focus:ring-1 focus:ring-[#f4b942] transition-colors text-sm"
            required
          >
            <option value="" className="bg-[#0f1729]">Select team to trade with</option>
            {teams.map((t) => (
              <option key={t._id} value={t._id} className="bg-[#0f1729]">{t.name}</option>
            ))}
          </select>
        </div>

        {targetTeam && (
          <div>
            <label className="text-xs text-slate-400 uppercase tracking-wider mb-1.5 block">Player You Want</label>
            <select
              value={requestedPlayerId}
              onChange={(e) => setRequestedPlayerId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white outline-none focus:border-[#f4b942] focus:ring-1 focus:ring-[#f4b942] transition-colors text-sm"
              required
            >
              <option value="" className="bg-[#0f1729]">Select player you want</option>
              {targetTeam.players.map((p) => (
                <option key={p._id} value={p._id} className="bg-[#0f1729]">{p.name}</option>
              ))}
            </select>
          </div>
        )}

        {myTeam && (
          <div>
            <label className="text-xs text-slate-400 uppercase tracking-wider mb-1.5 block">
              Offer a Player <span className="normal-case text-slate-600">(optional)</span>
            </label>
            <select
              value={offeredPlayerId}
              onChange={(e) => setOfferedPlayerId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white outline-none focus:border-[#f4b942] focus:ring-1 focus:ring-[#f4b942] transition-colors text-sm"
            >
              <option value="" className="bg-[#0f1729]">Offer a player (optional)</option>
              {myTeam.players.map((p) => (
                <option key={p._id} value={p._id} className="bg-[#0f1729]">{p.name}</option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="text-xs text-slate-400 uppercase tracking-wider mb-1.5 block">
            Offer Purse <span className="normal-case text-slate-600">(optional)</span>
          </label>
          <input
            type="number"
            placeholder="Amount"
            value={offeredPurse}
            onChange={(e) => setOfferedPurse(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-slate-600 outline-none focus:border-[#f4b942] focus:ring-1 focus:ring-[#f4b942] transition-colors text-sm"
          />
        </div>

        <button
          type="submit"
          className="mt-2 bg-[#f4b942] hover:bg-[#e5aa2f] text-[#0a0f1e] font-display font-semibold text-[15px] tracking-wide py-3 rounded-lg transition-colors"
        >
          Send Trade Request
        </button>
      </form>
    </div>
  )
}

export default ProposeTrade;