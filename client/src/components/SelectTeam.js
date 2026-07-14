import { useState, useEffect } from 'react';
import api from '../api/axios';

const SelectTeam = ({ onSelected }) => {
    const [error, setError] = useState("");
    const [teams, setTeams] = useState("");

    useEffect(() => {
        const fetchTeam = async () => {
            try {
                const res = await api.get('teams/unassigned/list');
                setTeams(res.data);
            }
            catch (err) {
                setError("Failed to load teams");
            }
        }
        fetchTeam();
    }, []);

    const handleSelect = async (teamId) => {
        try {
            await api.put(`/teams/${teamId}/select`);
            onSelected();
        }
        catch (err) {
            setError(err.response?.data?.message || 'Failed to select team');
        }
    };

  return (
    <div className="bg-[#0f1729] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/40">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&display=swap');
        .font-display { font-family: 'Oswald', sans-serif; }
      `}</style>

      <h2 className="font-display text-2xl text-white tracking-tight mb-1">Select Your Team</h2>
      <p className="text-slate-500 text-sm mb-6">Pick an unassigned franchise to lead into the auction.</p>

      {error && (
        <div className="mb-5 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {error}
        </div>
      )}

      {teams.length === 0 && (
        <div className="flex items-center gap-3 px-4 py-6 rounded-lg bg-white/5 border border-white/10 border-dashed justify-center">
          <p className="text-slate-500 text-sm">No unassigned teams available.</p>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {teams.length > 0 && teams.map((team) => {
            return (
            <button
            key={team._id}
            onClick={() => handleSelect(team._id)}
            className="group flex items-center justify-between gap-4 text-left bg-white/5 hover:bg-white/[0.08] border border-white/10 hover:border-[#f4b942]/40 p-4 rounded-xl transition-colors"
            >
                <div className="flex items-center gap-3 min-w-0">
                    <span className="shrink-0 w-9 h-9 rounded-full bg-[#f4b942]/15 text-[#f4b942] font-display font-semibold text-sm flex items-center justify-center">
                        {team.name?.charAt(0).toUpperCase()}
                    </span>
                    <span className="text-white text-sm font-medium truncate">{team.name}</span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                    <span className="text-slate-400 text-xs sm:text-sm">
                        Purse: <span className="text-[#f4b942] font-display tabular-nums">₹{team.purse.toLocaleString()}</span>
                    </span>
                    <span className="text-slate-600 group-hover:text-[#f4b942] transition-colors">→</span>
                </div>
            </button>
            )
        })}
      </div>
    </div>
  )
}

export default SelectTeam;