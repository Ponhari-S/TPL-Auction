import { useState, useEffect } from 'react'
import api from "../api/axios"

const BidAudit = () => {
  const [error, setError] = useState("");
  const [groups, setGroups] = useState([]);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    api.get('/players/audit/all')
      .then((res) => setGroups(res.data))
      .catch(() => setError('Failed to load audit data'))
  }, []);

  const toggle = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const soldGroups = groups.filter(({ player }) => player.status === 'sold');

  return (
    <div className="w-full bg-[#0f1729] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/40">
      <h2 className="font-display text-2xl text-white tracking-tight mb-1">Bid Audit</h2>
      <p className="text-slate-500 text-sm mb-6">Review every bid placed on sold players.</p>

      {error && (
        <div className="mb-5 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {error}
        </div>
      )}
      {soldGroups.length === 0 && !error && (
        <div className="flex items-center gap-3 px-4 py-6 rounded-lg bg-white/5 border border-white/10 border-dashed justify-center">
          <p className="text-slate-500 text-sm">No sold players yet.</p>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {soldGroups.map(({ player, bids }) => (
          <div key={player._id} className="bg-white/5 border border-white/10 rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => toggle(player._id)}
              className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors"
            >
              <div className="min-w-0">
                <span className="text-white text-sm font-semibold">{player.name}</span>
                <span className="text-slate-500 text-xs ml-2 capitalize">({player.role})</span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${player.status === 'sold'
                  ? 'bg-[#22c55e]/10 text-[#22c55e]'
                  : 'bg-white/10 text-slate-400'
                  }`}>
                  {player.status.replace('-', ' ')}
                </span>
                <span className="text-slate-500 text-xs">{bids.length} bid{bids.length !== 1 ? 's' : ''}</span>
                <span className="text-slate-500 text-xs">{expandedId === player._id ? '▲' : '▼'}</span>
              </div>
            </button>

            {expandedId === player._id && (
              <div className="border-t border-white/10 px-4 py-3 bg-black/20">
                {bids.length === 0 ? (
                  <p className="text-slate-500 text-xs">No bids were placed on this player.</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {bids.map((log) => (
                      <div key={log._id} className="flex items-center justify-between gap-2 text-xs">
                        <span className="text-slate-300 truncate">
                          {log.team?.name}
                          {log.type === 'rtm' && <span className="text-purple-400 ml-1">(RTM)</span>}
                          <span className="text-slate-600 ml-2">
                            {new Date(log.createdAt).toLocaleTimeString()}
                          </span>
                        </span>
                        <span className="text-[#f4b942] font-semibold tabular-nums shrink-0">₹{log.amount.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default BidAudit;