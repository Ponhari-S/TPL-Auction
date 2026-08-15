import { useEffect, useState } from "react";
import Header from "../components/Header";
import api from "../api/axios";

const SummaryPage = () => {
    const [teams, setTeams] = useState([]);
    const [error, setError] = useState("");
    const [unsoldPlayers,setUnsoldPlayers] = useState([]);

    useEffect(() => {
        Promise.all([api.get('/teams'), api.get('/players')])
        .then(([teamsRes,playersRes]) => {
            setTeams(teamsRes.data);
            setUnsoldPlayers(playersRes.data.filter((p)=>p.status==='unsold-final'));
        })
        .catch((err) => setError('Failed to load summary'));
    }, []);

    const getSpent = (teams) => teams.players.reduce((sum, p) => sum + (p.soldPrice || p.retentionPrice || 0), 0);

    const allSoldPlayers = teams.flatMap((team)=>team.players.map((p)=>({...p,teamName:team.name})));

    const mostExpensive = allSoldPlayers.length ? allSoldPlayers.reduce((max,p)=>{
        const price = p.soldPrice || p.retentionPrice || 0;
        const maxPrice = max.soldPrice || max.retentionPrice || 0;
        return price > maxPrice ? p :max;
    },allSoldPlayers[0]) : null;
    
    const bestValue = allSoldPlayers.length ? allSoldPlayers.reduce((best,p)=>{
        const price = p.soldPrice || p.retentionPrice || 1;
        const bestPrice = best.soldPrice || best.retentionPrice || 1;
        const priceGap = price - p.basePrice;
        const bestPriceGap = bestPrice - best.basePrice;
        return priceGap < bestPriceGap ? p : best;
    },allSoldPlayers[0]) : null;

  return (
    <div className="min-h-screen bg-[#0a0f1e]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&display=swap');
        .font-display { font-family: 'Oswald', sans-serif; }
      `}</style>
      <Header />
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="font-display text-2xl text-white tracking-tight mb-6">Auction Summary</h1>

        {error && (
          <div className="mb-5 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {error}
          </div>
        )}

        {!error && teams.length === 0 && (
          <div className="flex items-center justify-center px-4 py-10 rounded-2xl bg-[#0f1729] border border-white/10 border-dashed">
            <p className="text-slate-500 text-sm">No teams to summarize yet.</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {mostExpensive && (
            <div className="bg-[#f4b942]/5 border border-[#f4b942]/30 rounded-2xl p-6 shadow-xl shadow-black/30">
            <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Most Expensive</p>
            <p className="font-display text-xl text-white tracking-tight">{mostExpensive.name}</p>
            <p className="text-[#f4b942] font-display tabular-nums text-sm mt-1">
                ₹{(mostExpensive.soldPrice || mostExpensive.retentionPrice).toLocaleString()}
                <span className="text-slate-500 font-body"> — {mostExpensive.teamName}</span>
            </p>
            </div>
        )}
        {bestValue && (
            <div className="bg-[#22c55e]/5 border border-[#22c55e]/30 rounded-2xl p-6 shadow-xl shadow-black/30">
            <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Best Value Pick</p>
            <p className="font-display text-xl text-white tracking-tight">{bestValue.name}</p>
            <p className="text-[#22c55e] font-display tabular-nums text-sm mt-1">
                ₹{(bestValue.soldPrice || bestValue.retentionPrice).toLocaleString()}
                <span className="text-slate-500 font-body"> — {bestValue.teamName}</span>
            </p>
            </div>
        )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {teams.map((team) => (
            <div key={team._id} className="bg-[#0f1729] border border-white/10 rounded-2xl p-6 shadow-xl shadow-black/30">
              <h2 className="font-display text-lg text-white tracking-tight mb-1">{team.name}</h2>
              <p className="text-slate-500 text-xs mb-4">
                Spent: <span className="text-[#f4b942] font-display tabular-nums">₹{getSpent(team).toLocaleString()}</span> ·
                Remaining: <span className="text-white font-display tabular-nums">₹{team.remainingPurse.toLocaleString()}</span>
              </p>

              <div className="space-y-1">
                {team.players.map((p) => (
                  <div key={p._id} className="flex justify-between text-xs">
                    <span className="text-slate-300">{p.name} <span className="text-slate-600 capitalize">({p.role})</span></span>
                    <span className="text-[#f4b942] font-display tabular-nums">₹{(p.soldPrice || p.retentionPrice || 0).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {unsoldPlayers.length > 0 && (
            <div className="mt-8 bg-[#0f1729] border border-white/10 rounded-2xl p-6 shadow-xl shadow-black/30">
                <h2 className="font-display text-lg text-white tracking-tight mb-3">
                Unsold Players <span className="text-slate-500">({unsoldPlayers.length})</span>
                </h2>
                <div className="flex flex-wrap gap-2">
                {unsoldPlayers.map((p) => (
                    <span key={p._id} className="bg-white/5 border border-white/10 text-slate-400 text-xs px-3 py-1.5 rounded-full">
                    {p.name} <span className="text-slate-600 capitalize">({p.role})</span>
                    </span>
                ))}
                </div>
            </div>
        )}

      </div>
    </div>
  )
}

export default SummaryPage;