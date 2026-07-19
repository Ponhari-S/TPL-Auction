import { useState, useEffect } from 'react';
import api from '../api/axios';

const PlayerInfo = () => {
    const [player, setPlayer] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [registered, setRegistered] = useState(false);

    const handleRegister = async () => {
        setRegistered(true);
        try {
            const res = await api.put('players/me/register');
            setPlayer(res.data);
        }
        catch (err) {
            setError(err.response?.data?.message || 'Failed to Register');
        }
        finally {
            setRegistered(false);
        }
    };

    useEffect(() => {
        const fetchPlayer = async () => {
        try {
            const res = await api.get('/players/me/profile');
            setPlayer(res.data);
        }
        catch (err) {
            setError(err.response?.data?.message || 'Failed to load player info');
        }
        finally {
            setLoading(false);
        }
    }
    fetchPlayer();
    }, []);

    const statusStyles = {
        sold: "bg-[#22c55e]/15 text-[#22c55e] border-[#22c55e]/30",
        unsold: "bg-red-500/15 text-red-400 border-red-500/30",
        available: "bg-[#f4b942]/15 text-[#f4b942] border-[#f4b942]/30"
    };

    if (loading) {
        return (
            <div className="bg-[#0f1729] border border-white/10 rounded-2xl p-6 flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-[#f4b942] animate-pulse" />
                <p className="text-slate-400 text-sm">Loading player info...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-[#0f1729] border border-red-500/30 rounded-2xl p-6">
                <p className="text-red-400 text-sm">{error}</p>
            </div>
        );
    }

    return (
        <div className="bg-[#0f1729] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/40">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&display=swap');
                .font-display { font-family: 'Oswald', sans-serif; }
            `}</style>

            <div className="flex items-start justify-between gap-4">
                <div>
                    <h2 className="font-display text-2xl text-white tracking-tight">{player.name}</h2>
                    <span className="inline-block mt-2 px-3 py-1 rounded-full bg-[#f4b942]/10 border border-[#f4b942]/30 text-[#f4b942] text-xs uppercase tracking-wider capitalize">
                        {player.role}
                    </span>
                </div>
                <span className={`px-3 py-1 rounded-full border text-xs uppercase tracking-wider capitalize whitespace-nowrap ${statusStyles[player.status] || "bg-white/5 text-slate-300 border-white/10"}`}>
                    {player.status}
                </span>
            </div>

            {player.status !== 'sold' && player.status !== 'registered' && (
                <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between gap-4 flex-wrap">
                    <p className="text-slate-500 text-sm">
                        Status: <span className="text-white capitalize">{player.status}</span>
                    </p>
                    <button
                        onClick={handleRegister}
                        disabled={registered}
                        className="bg-[#f4b942] hover:bg-[#e5aa2f] disabled:opacity-50 disabled:cursor-not-allowed text-[#0a0f1e] font-display font-semibold text-sm px-4 py-2 rounded-lg transition-colors"
                    >
                        {registered ? 'Registering...' : 'Register for Auction'}
                    </button>
                </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
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
            </div>
        </div>
    )
}

export default PlayerInfo