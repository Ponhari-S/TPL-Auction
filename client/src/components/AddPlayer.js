import { useState, useEffect } from 'react';
import api from '../api/axios';

function AddPlayer() {
  const [formData, setFormData] = useState({
    name: '',
    role: 'batsman',
    matches: '',
    runs: '',
    wickets: '',
    average: '',
    strikeRate: ''
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [unlinkedUsers, setUnlinkedUsers] = useState([]);
  const [userId, setUserId] = useState('');

  useEffect(() => {
    api.get('/auth/unlinked-users').then((res) => setUnlinkedUsers(res.data));
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setSaving(true);

    try {
      const res = await api.post('/players', {
        userId: userId || null,
        name: formData.name,
        role: formData.role,
        stats: {
          matches: Number(formData.matches) || 0,
          runs: Number(formData.runs) || 0,
          wickets: Number(formData.wickets) || 0,
          average: Number(formData.average) || 0,
          strikeRate: Number(formData.strikeRate) || 0
        }
      });

      setMessage(
        res.data.overallRating
          ? `${res.data.name} added — rated ${res.data.overallRating}/10 (${res.data.pool}), base price ₹${res.data.basePrice.toLocaleString()}`
          : `${res.data.name} added — rating pending/failed, base price not yet set`
      );

      setFormData({
        name: '',
        role: 'batsman',
        matches: '',
        runs: '',
        wickets: '',
        average: '',
        strikeRate: ''
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add player');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-[#0f1729] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/40">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&display=swap');
        .font-display { font-family: 'Oswald', sans-serif; }
      `}</style>

      <h2 className="font-display text-2xl text-white tracking-tight mb-1">Add Player</h2>
      <p className="text-slate-500 text-sm mb-6">Enter their stats to get them rated and pooled for the auction.</p>

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
          <label className="text-xs text-slate-400 uppercase tracking-wider mb-1.5 block">Player Name</label>
          <input
            type="text"
            name="name"
            placeholder="Full name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-slate-600 outline-none focus:border-[#f4b942] focus:ring-1 focus:ring-[#f4b942] transition-colors text-sm"
            required
          />
        </div>

        <select
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white outline-none focus:border-[#f4b942] focus:ring-1 focus:ring-[#f4b942] transition-colors text-sm"
        >
          <option value="" className="bg-[#0f1729]">Link to a user account</option>
          {unlinkedUsers.map((u) => (
            <option key={u._id} value={u._id} className="bg-[#0f1729]">{u.name} ({u.role})</option>
          ))}
        </select>

        <div>
          <label className="text-xs text-slate-400 uppercase tracking-wider mb-1.5 block">Role</label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white outline-none focus:border-[#f4b942] focus:ring-1 focus:ring-[#f4b942] transition-colors text-sm"
          >
            <option value="batsman" className="bg-[#0f1729]">Batsman</option>
            <option value="bowler" className="bg-[#0f1729]">Bowler</option>
            <option value="all-rounder" className="bg-[#0f1729]">All-Rounder</option>
            <option value="wicketkeeper" className="bg-[#0f1729]">Wicketkeeper</option>
          </select>
        </div>

        <div>
          <label className="text-xs text-slate-400 uppercase tracking-wider mb-1.5 block">Stats</label>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              name="matches"
              placeholder="Matches"
              value={formData.matches}
              onChange={handleChange}
              className="px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-slate-600 outline-none focus:border-[#f4b942] focus:ring-1 focus:ring-[#f4b942] transition-colors text-sm"
            />
            <input
              type="number"
              name="runs"
              placeholder="Runs"
              value={formData.runs}
              onChange={handleChange}
              className="px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-slate-600 outline-none focus:border-[#f4b942] focus:ring-1 focus:ring-[#f4b942] transition-colors text-sm"
            />
            <input
              type="number"
              name="wickets"
              placeholder="Wickets"
              value={formData.wickets}
              onChange={handleChange}
              className="px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-slate-600 outline-none focus:border-[#f4b942] focus:ring-1 focus:ring-[#f4b942] transition-colors text-sm"
            />
            <input
              type="number"
              name="average"
              placeholder="Average"
              step="0.1"
              value={formData.average}
              onChange={handleChange}
              className="px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-slate-600 outline-none focus:border-[#f4b942] focus:ring-1 focus:ring-[#f4b942] transition-colors text-sm"
            />
            <input
              type="number"
              name="strikeRate"
              placeholder="Strike Rate"
              step="0.1"
              value={formData.strikeRate}
              onChange={handleChange}
              className="px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-slate-600 outline-none focus:border-[#f4b942] focus:ring-1 focus:ring-[#f4b942] transition-colors text-sm col-span-2 sm:col-span-1"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="mt-2 bg-[#f4b942] hover:bg-[#e5aa2f] disabled:opacity-50 disabled:cursor-not-allowed text-[#0a0f1e] font-display font-semibold text-[15px] tracking-wide py-3 rounded-lg transition-colors"
        >
          {saving ? 'Adding & Rating...' : 'Add Player'}
        </button>
      </form>
    </div>
  );
}

export default AddPlayer;