import { useState } from 'react';
import api from '../api/axios';

const BuildQueue = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const handleBuild = async () => {
        setLoading(true);
        setMessage("");
        setError("");
        try {
            const res = await api.post('/auction/build-queue');
            setMessage(res.data.message);
        }
        catch (err) {
            setError(err.response?.data?.message || 'Failed to build queue');
        }
        finally {
            setLoading(false);
        }
    }
  return (
    <div className="bg-[#0f1729] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/40">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&display=swap');
        .font-display { font-family: 'Oswald', sans-serif; }
      `}</style>

      <h2 className="font-display text-2xl text-white tracking-tight mb-1">Auction Queue</h2>
      <p className="text-slate-500 text-sm mb-6">
        Rebuilds the queue from all currently registered players, ordered Marquee → Elite → Rookie.
      </p>

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

      <button
        type='button'
        onClick={handleBuild}
        disabled={loading}
        className="bg-[#f4b942] hover:bg-[#e5aa2f] disabled:opacity-50 disabled:cursor-not-allowed text-[#0a0f1e] font-display font-semibold text-sm tracking-wide px-5 py-2.5 rounded-lg transition-colors inline-flex items-center gap-2"
      >
        {loading && <span className="w-1.5 h-1.5 rounded-full bg-[#0a0f1e] animate-pulse" />}
        {loading ? 'Building...' : 'Build Auction Queue'}
      </button>
    </div>
  )
}

export default BuildQueue;