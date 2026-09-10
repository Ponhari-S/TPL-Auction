import { useEffect, useState } from "react";
import Header from "../components/Header";
import api from "../api/axios";
import { formatPrice } from "../utils/formatCurrency";

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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-white/10">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl text-white tracking-tight">Auction Summary</h1>
            <p className="text-slate-500 text-sm mt-0.5">Overview of team rosters, spend, and top player picks.</p>
          </div>
          {teams.length > 0 && (
            <span className="self-start sm:self-auto text-slate-500 text-xs font-medium bg-white/5 px-3 py-1 rounded-full border border-white/10">
              {teams.length} Franchises
            </span>
          )}
        </div>

        {error && (
          <div className="mb-5 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {error}
          </div>
        )}

        {!error && teams.length === 0 && (
          <div className="flex items-center justify-center px-4 py-12 rounded-2xl bg-[#0f1729] border border-white/10 border-dashed text-center">
            <p className="text-slate-500 text-sm">No teams to summarize yet.</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {mostExpensive && (
            <div className="bg-[#f4b942]/5 border border-[#f4b942]/30 rounded-2xl p-5 shadow-xl shadow-black/30">
            <p className="text-slate-500 text-xs uppercase tracking-wider mb-1 font-medium">Most Expensive</p>
            <p className="font-display text-xl text-white tracking-tight truncate">{mostExpensive.name}</p>
            <p className="text-[#f4b942] font-display tabular-nums text-sm mt-1">
                {formatPrice(mostExpensive.soldPrice || mostExpensive.retentionPrice)}
                <span className="text-slate-500 font-sans font-normal"> — {mostExpensive.teamName}</span>
            </p>
            </div>
        )}
        {bestValue && (
            <div className="bg-[#22c55e]/5 border border-[#22c55e]/30 rounded-2xl p-5 shadow-xl shadow-black/30">
            <p className="text-slate-500 text-xs uppercase tracking-wider mb-1 font-medium">Best Value Pick</p>
            <p className="font-display text-xl text-white tracking-tight truncate">{bestValue.name}</p>
            <p className="text-[#22c55e] font-display tabular-nums text-sm mt-1">
                {formatPrice(bestValue.soldPrice || bestValue.retentionPrice)}
                <span className="text-slate-500 font-sans font-normal"> — {bestValue.teamName}</span>
            </p>
            </div>
        )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {teams.map((team) => {
            const spent = getSpent(team);
            return (
              <div key={team._id} className="bg-[#0f1729] border border-white/10 rounded-2xl p-5 shadow-xl shadow-black/30 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <h2 className="font-display text-lg text-white tracking-tight truncate">{team.name}</h2>
                    <span className="shrink-0 text-[11px] font-medium px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-400">
                      {team.players.length} {team.players.length === 1 ? 'Player' : 'Players'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-400 pb-3 border-b border-white/10 mb-3">
                    <span>Spent: <span className="text-[#f4b942] font-display tabular-nums">{formatPrice(spent)}</span></span>
                    <span>Remaining: <span className="text-white font-display tabular-nums">{formatPrice(team.remainingPurse)}</span></span>
                  </div>

                  <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                    {team.players.map((p) => (
                      <div key={p._id} className="flex justify-between items-center text-xs gap-2 py-0.5">
                        <span className="text-slate-300 truncate">{p.name} <span className="text-slate-500 capitalize text-[11px]">({p.role})</span></span>
                        <span className="text-[#f4b942] font-display tabular-nums shrink-0">{formatPrice(p.soldPrice || p.retentionPrice || 0)}</span>
                      </div>
                    ))}
                    {team.players.length === 0 && (
                      <p className="text-slate-600 text-xs italic py-2">No players acquired</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {unsoldPlayers.length > 0 && (
            <div className="bg-[#0f1729] border border-white/10 rounded-2xl p-6 shadow-xl shadow-black/30">
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
      </main>
    </div>
  )
}

export default SummaryPage;