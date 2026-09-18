import { useState, useEffect } from 'react';
import api from '../api/axios';
import { formatPrice } from '../utils/formatCurrency';

const BidHistory = ({ playerId }) => {
  const [logs, setLogs] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open || !playerId) return;
    api.get(`/players/${playerId}/bid-history`).then((res) => {
      setLogs(Array.isArray(res.data) ? res.data : []);
    });
  }, [playerId, open]);

  return (
    <div className="mt-6 bg-white/5 border border-white/10 rounded-xl p-4 text-left">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <p className="text-slate-500 text-xs uppercase tracking-wider font-medium">Bid History</p>
          {open && logs.length > 0 && (
            <span className="text-[11px] bg-white/10 text-slate-300 px-2 py-0.5 rounded-full border border-white/10 tabular-nums">
              {logs.length}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <span>{open ? 'Hide' : 'Show'}</span>
          <svg
            className={`w-3.5 h-3.5 transform transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {open && (
        <div className="mt-3 pt-3 border-t border-white/10">
          {logs.length === 0 ? (
            <p className="text-slate-500 text-xs py-3 text-center">No bids yet on this player.</p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {logs.map((log) => (
                <div
                  key={log._id}
                  className="flex items-center justify-between py-2 px-3 rounded-lg bg-white/5 border border-white/5 hover:border-white/10 transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-6 h-6 rounded bg-[#f4b942]/15 text-[#f4b942] text-xs font-semibold flex items-center justify-center shrink-0">
                      {log.team?.name?.charAt(0).toUpperCase() || 'T'}
                    </span>
                    <span className="text-slate-200 text-xs font-medium truncate">
                      {log.team?.name}
                    </span>
                    {log.type === 'rtm' && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase shrink-0">
                        RTM
                      </span>
                    )}
                  </div>

                  <span className="font-display text-[#f4b942] text-sm sm:text-base font-semibold tabular-nums shrink-0 ml-2">
                    {formatPrice(log.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BidHistory;