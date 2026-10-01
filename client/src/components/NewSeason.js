import { useState } from 'react';
import api from '../api/axios';

function NewSeason() {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [confirming, setConfirming] = useState(false);

  const handleStart = async () => {
    setMessage('');
    setError('');
    try {
      const res = await api.post('/auction/new-season');
      setMessage(res.data.message);
      setConfirming(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to start new season');
    }
  };

  return (
    <div className="bg-[#0f1729] border border-red-500/20 rounded-2xl p-6">
      <h2 className="font-display text-lg text-white mb-2">Start New Season</h2>
      <p className="text-slate-500 text-xs mb-4">
        Increments the season counter — every team gets a fresh retain and RTM. Squads and purses carry over unchanged.
      </p>

      {message && <p className="text-green-400 text-sm mb-3">{message}</p>}
      {error && <p className="text-red-400 text-sm mb-3">{error}</p>}

      {confirming ? (
        <div className="flex gap-2">
          <button onClick={handleStart} className="bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-2 rounded-lg">
            Confirm — this can't be undone
          </button>
          <button onClick={() => setConfirming(false)} className="text-slate-500 hover:text-slate-400 text-sm">
            Cancel
          </button>
        </div>
      ) : (
        <button onClick={() => setConfirming(true)} className="bg-white/5 border border-red-500/30 hover:bg-red-500/10 text-red-400 text-sm font-semibold px-4 py-2 rounded-lg">
          Start New Season
        </button>
      )}
    </div>
  );
}

export default NewSeason;