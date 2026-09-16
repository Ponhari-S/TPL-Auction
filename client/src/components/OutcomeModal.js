import React, { useEffect, useState } from 'react';
import { formatPrice } from '../utils/formatCurrency';

const OutcomeModal = ({ outcome, onClose, duration = 3500 }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!outcome) {
      setVisible(false);
      return;
    }

    setVisible(true);

    const timer = setTimeout(() => {
      setVisible(false);
      if (onClose) {
        onClose();
      }
    }, duration);

    return () => clearTimeout(timer);
  }, [outcome, onClose, duration]);

  if (!outcome || !visible) return null;

  const isSold = outcome.type === 'sold';
  const isUnsold = outcome.type === 'unsold';
  const isUnsoldFinal = outcome.type === 'unsold-final';
  const role = outcome.role || outcome.player?.role;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div
        className={`w-full max-w-[340px] sm:max-w-[380px] rounded-2xl p-5 sm:p-6 text-center border shadow-2xl transition-all duration-300 ${isSold
          ? 'bg-gradient-to-b from-[#0f1f2e] to-[#0f1729] border-[#22c55e]/40 shadow-[0_0_50px_-10px_rgba(34,197,94,0.3)] ring-1 ring-[#22c55e]/20'
          : isUnsoldFinal
            ? 'bg-gradient-to-b from-[#241219] to-[#0f1729] border-red-500/30 shadow-[0_0_50px_-10px_rgba(239,68,68,0.25)] ring-1 ring-red-500/20'
            : 'bg-gradient-to-b from-[#1c1b26] to-[#0f1729] border-[#f4b942]/30 shadow-[0_0_50px_-10px_rgba(244,185,66,0.2)] ring-1 ring-[#f4b942]/20'
          }`}
      >
        <div className="mb-4">
          {isSold && (
            <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-display tracking-widest uppercase bg-[#22c55e]/15 border border-[#22c55e]/30 text-[#22c55e]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22c55e] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#22c55e]" />
              </span>
              Sold
            </span>
          )}

          {isUnsold && (
            <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-display tracking-widest uppercase bg-[#f4b942]/15 border border-[#f4b942]/30 text-[#f4b942]">
              <span className="w-2 h-2 rounded-full bg-[#f4b942]" />
              Unsold • Re-queued
            </span>
          )}

          {isUnsoldFinal && (
            <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-display tracking-widest uppercase bg-red-500/15 border border-red-500/30 text-red-400">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              Unsold • Removed
            </span>
          )}
        </div>

        <h2 className="font-display text-2xl sm:text-3xl text-white font-bold tracking-tight truncate">
          {outcome.playerName}
        </h2>

        {role && (
          <div className="flex items-center justify-center mt-1.5">
            <span className="bg-white/5 border border-white/10 text-slate-400 text-xs px-2.5 py-0.5 rounded-full capitalize">
              {role}
            </span>
          </div>
        )}

        {isSold && (
          <div className="mt-4 bg-[#f4b942]/5 border border-[#f4b942]/20 rounded-xl p-3.5 sm:p-4 text-center">
            <p className="text-slate-400 text-[11px] uppercase tracking-wider font-medium">Acquired By</p>
            <p className="font-display text-lg sm:text-xl text-white font-semibold mt-0.5 tracking-wide truncate">
              {outcome.teamName}
            </p>

            <div className="mt-2.5 pt-2.5 border-t border-white/10">
              <p className="text-slate-400 text-[11px] uppercase tracking-wider font-medium">Winning Bid</p>
              <p className="font-display text-3xl sm:text-4xl text-[#f4b942] tabular-nums font-bold mt-0.5">
                {formatPrice(outcome.price)}
              </p>
            </div>
          </div>
        )}

        {isUnsold && (
          <div className="mt-4 bg-white/5 border border-white/10 rounded-xl p-4 text-center">
            <div className="w-9 h-9 mx-auto rounded-full bg-[#f4b942]/10 border border-[#f4b942]/20 flex items-center justify-center text-[#f4b942] mb-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <p className="text-white font-display text-base tracking-wide">Returned to Pool</p>
            <p className="text-slate-400 text-xs mt-1">No bids placed • Will appear in round 2</p>
          </div>
        )}

        {isUnsoldFinal && (
          <div className="mt-4 bg-red-500/5 border border-red-500/20 rounded-xl p-4 text-center">
            <div className="w-9 h-9 mx-auto rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mb-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="text-white font-display text-base tracking-wide">Removed from Auction</p>
            <p className="text-slate-400 text-xs mt-1">No bids on second pass • Out of auction</p>
          </div>
        )}

        <div className="mt-4 flex items-center justify-center gap-2 text-slate-500 text-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-[#f4b942] animate-pulse" />
          <span>Next player coming up shortly...</span>
        </div>
      </div>
    </div>
  );
};

export default OutcomeModal;