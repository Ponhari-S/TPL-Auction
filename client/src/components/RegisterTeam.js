import { useState } from "react";
import api from "../api/axios";

const RegisterTeam = () => {
    const [formData, setFormData] = useState({
        name: "",
        logo: "",
        purse: ""
    });
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        try {
            const res = await api.post('/teams', {
                ...formData,
                purse: Number(formData.purse)
            });
            setMessage(`Team "${res.data.name}" created successfully`);
            setFormData({ name: "", logo: "", captain: "", purse: "" });
        }
        catch (err) {
            setError(err.response?.data?.message || 'Failed to create team');
        }
    }
  return (
    <div className="bg-[#0f1729] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/40">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&display=swap');
        .font-display { font-family: 'Oswald', sans-serif; }
      `}</style>

      <h2 className="font-display text-2xl text-white tracking-tight mb-1">Register Team</h2>
      <p className="text-slate-500 text-sm mb-6">Add a new franchise to the auction.</p>

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
          <label className="text-xs text-slate-400 uppercase tracking-wider mb-1.5 block">Team Name</label>
          <input
            type="text"
            name="name"
            placeholder="Chennai Super Kings"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-slate-600 outline-none focus:border-[#f4b942] focus:ring-1 focus:ring-[#f4b942] transition-colors text-sm"
            required
          />
        </div>

        <div>
          <label className="text-xs text-slate-400 uppercase tracking-wider mb-1.5 block">Logo URL <span className="normal-case text-slate-600">(optional)</span></label>
          <input
            type="text"
            name="logo"
            placeholder="https://..."
            value={formData.logo}
            onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-slate-600 outline-none focus:border-[#f4b942] focus:ring-1 focus:ring-[#f4b942] transition-colors text-sm"
          />
        </div>

        <div>
          <label className="text-xs text-slate-400 uppercase tracking-wider mb-1.5 block">Captain's User ID</label>
          <input
            type="text"
            name="captain"
            placeholder="Enter user ID"
            value={formData.captain}
            onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-slate-600 outline-none focus:border-[#f4b942] focus:ring-1 focus:ring-[#f4b942] transition-colors text-sm"
            required
          />
        </div>

        <div>
          <label className="text-xs text-slate-400 uppercase tracking-wider mb-1.5 block">Purse Amount</label>
          <input
            type="number"
            name="purse"
            placeholder="e.g. 10000000"
            value={formData.purse}
            onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-slate-600 outline-none focus:border-[#f4b942] focus:ring-1 focus:ring-[#f4b942] transition-colors text-sm"
            required
          />
        </div>

        <button
          type="submit"
          className="mt-2 bg-[#f4b942] hover:bg-[#e5aa2f] text-[#0a0f1e] font-display font-semibold text-[15px] tracking-wide py-3 rounded-lg transition-colors"
        >
          Create Team
        </button>
      </form>
    </div>
  )
}

export default RegisterTeam;