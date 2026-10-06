import { useEffect, useState } from "react";
import api from "../api/axios";

const UpdatePlayerStats = () => {
    const [message,setMessage] =useState('');
    const [error,setError] = useState('');
    const [players,setPlayers] = useState([]);
    const [saving,setSaving] = useState(false);
    const [editing,setEditing] = useState(null);
    const [form,setForm] = useState([]);

    const fetchData = () => {
        api.get('/players/all/for-season-update').then((res)=>setPlayers(res.data));
    }

    useEffect(()=>{
        fetchData();
    },[]);

    const startEdit = (p) => {
        setEditing(p._id);
        setForm({
            matches: p.stats.matches,
            runs: p.stats.runs,
            wickets: p.stats.wickets,
            average: p.stats.average,
            strikeRate: p.stats.strikeRate
        });
        setMessage('');
        setError('');
    }

    const handleChange = (e) => {
        setForm({...form, [e.target.name]: e.target.value});
    }

    const handleSave = async (playerId) => {
        setSaving(true);
        setMessage('');
        setError('');
        try{
            const res = await api.put(`/players/${playerId}`, {
                stats: {
                  matches: Number(form.matches) || 0,
                  runs: Number(form.runs) || 0,
                  wickets: Number(form.wickets) || 0,
                  average: Number(form.average) || 0,
                  strikeRate: Number(form.strikeRate) || 0
                }
              });
            setMessage(`${res.data.name} updated — new rating ${res.data.overallRating}/10 (${res.data.pool})`);
            setEditing(null);
            fetchData();
        }
        catch(err){
            setError(err.response?.data?.message || 'Failed to update player');
        }
        finally{
            setSaving(false);
        }
    }

  return (
    <div className="bg-[#0f1729] border border-white/10 rounded-2xl p-6">
      <h2 className="font-display text-lg text-white mb-4">Update Stats for New Season</h2>

      {message && <p className="text-green-400 text-sm mb-3">{message}</p>}
      {error && <p className="text-red-400 text-sm mb-3">{error}</p>}

      <div className="flex flex-col gap-2 max-h-[32rem] overflow-y-auto">
        {players.map((p) => (
          <div key={p._id} className="bg-white/5 border border-white/10 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-white text-sm font-semibold">{p.name}</span>
                <span className="text-slate-500 text-xs ml-2 capitalize">({p.role})</span>
                <span className="text-[#f4b942] text-xs ml-2">★ {p.overallRating ?? '—'}</span>
              </div>
              {editing !== p._id && (
                <button onClick={() => startEdit(p)} className="text-slate-400 hover:text-white text-xs underline">
                  Edit
                </button>
              )}
            </div>

            {editing === p._id && (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-3">
                <input name="matches" type="number" placeholder="Matches" value={form.matches} onChange={handleChange} className="p-1.5 rounded bg-white/5 border border-white/10 text-white text-xs" />
                <input name="runs" type="number" placeholder="Runs" value={form.runs} onChange={handleChange} className="p-1.5 rounded bg-white/5 border border-white/10 text-white text-xs" />
                <input name="wickets" type="number" placeholder="Wickets" value={form.wickets} onChange={handleChange} className="p-1.5 rounded bg-white/5 border border-white/10 text-white text-xs" />
                <input name="average" type="number" step="0.1" placeholder="Average" value={form.average} onChange={handleChange} className="p-1.5 rounded bg-white/5 border border-white/10 text-white text-xs" />
                <input name="strikeRate" type="number" step="0.1" placeholder="Strike Rate" value={form.strikeRate} onChange={handleChange} className="p-1.5 rounded bg-white/5 border border-white/10 text-white text-xs" />
                <div className="col-span-2 sm:col-span-5 flex gap-2 mt-1">
                  <button onClick={() => handleSave(p._id)} disabled={saving} className="bg-[#f4b942] hover:bg-[#e5aa2f] disabled:opacity-50 text-[#0a0f1e] text-xs font-semibold px-3 py-1.5 rounded">
                    {saving ? 'Saving...' : 'Save & Re-rate'}
                  </button>
                  <button onClick={() => setEditing(null)} className="text-slate-500 hover:text-slate-400 text-xs">
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default UpdatePlayerStats;