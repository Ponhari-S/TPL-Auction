import { useEffect, useState } from "react";
import api from "../api/axios";

const AuctionRules = () => {
    const [rules, setRules] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchRules = async () => {
            try {
                const res = await api.get('/auction/rules');
                setRules(res.data);
            }
            catch (err) {
                setError("Failed to Load Error");
            }
        };

        fetchRules();
    }, []);

    const handleChange = (e) => {
        setRules({ ...rules, [e.target.name]: Number(e.target.value) });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");
        try {
            const res = await api.put('/auction/rules', {
                minIncrement: rules.minIncrement,
                squadSize: rules.squadSize,
                maxRetentions:rules.maxRetentions,
                minRetentionPrice:rules.minRetentionPrice,
                maxRetentionPrice:rules.maxRetentionPrice

            })
            setRules(res.data);
            setMessage("Auction rules updated");
        }
        catch (err) {
            setError(err.response?.data?.message || 'Failed to update rules');
        }
    };

    if (!rules) {
        return (
            <div className="bg-[#0f1729] border border-white/10 rounded-2xl p-6 flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-[#f4b942] animate-pulse" />
                <p className="text-slate-400 text-sm">Loading auction rules...</p>
            </div>
        );
    }

    return (
        <div className="bg-[#0f1729] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/40">
          <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&display=swap');
            .font-display { font-family: 'Oswald', sans-serif; }
          `}</style>

          <h2 className="font-display text-2xl text-white tracking-tight mb-1">Auction Rules</h2>
          <p className="text-slate-500 text-sm mb-6">Set the ground rules before bidding opens.</p>

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
              <label className="text-xs text-slate-400 uppercase tracking-wider mb-1.5 block">
                Minimum Bid Increment
              </label>
              <input
                type="number"
                name="minIncrement"
                value={rules.minIncrement}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-slate-600 outline-none focus:border-[#f4b942] focus:ring-1 focus:ring-[#f4b942] transition-colors text-sm"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 uppercase tracking-wider mb-1.5 block">
                Squad Size
              </label>
              <input
                type="number"
                name="squadSize"
                value={rules.squadSize}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-slate-600 outline-none focus:border-[#f4b942] focus:ring-1 focus:ring-[#f4b942] transition-colors text-sm"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 uppercase tracking-wider mb-1.5 block">
                Maximum Retentions
              </label>
              <input
                type="number"
                name="maxRetentions"
                value={rules.maxRetentions}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-slate-600 outline-none focus:border-[#f4b942] focus:ring-1 focus:ring-[#f4b942] transition-colors text-sm"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 uppercase tracking-wider mb-1.5 block">
                Minimum Retention Price
              </label>
              <input
                type="number"
                name="minRetentionPrice"
                value={rules.minRetentionPrice}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-slate-600 outline-none focus:border-[#f4b942] focus:ring-1 focus:ring-[#f4b942] transition-colors text-sm"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 uppercase tracking-wider mb-1.5 block">
              Maximum Retention Price
              </label>
              <input
                type="number"
                name="maxRetentionPrice"
                value={rules.maxRetentionPrice}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-slate-600 outline-none focus:border-[#f4b942] focus:ring-1 focus:ring-[#f4b942] transition-colors text-sm"
              />
            </div>

            <button
              type="submit"
              className="mt-2 bg-[#f4b942] hover:bg-[#e5aa2f] text-[#0a0f1e] font-display font-semibold text-[15px] tracking-wide py-3 rounded-lg transition-colors"
            >
              Save Rules
            </button>
          </form>
        </div>
      );
}

export default AuctionRules;