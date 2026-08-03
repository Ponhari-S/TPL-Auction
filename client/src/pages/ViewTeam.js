import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import Header from '../components/Header';
import api from '../api/axios';

function ViewTeam() {
  const [showGiveCaptaincy, setShowGiveCaptaincy] = useState(false);
  const [transferError, setTransferError] = useState("");
  const [confirmingRelease, setConfirmingRelease] = useState(null);
  const [releaseMessage, setReleaseMessage] = useState("");
  const { user } = useSelector((state) => state.auth);
  const [team, setTeam] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const teamsRes = await api.get('/teams');
        let myTeam = null;
        if (user?.role === 'captain') {
          myTeam = teamsRes.data.find(
            (t) => t.captain?._id === user._id || t.captain === user._id
          );
        } else if (user?.role === 'player') {
          const profileRes = await api.get('/players/me/profile');
          const teamId = profileRes.data.soldTo || profileRes.data.retainedBy;
          myTeam = teamsRes.data.find((t) => t._id === teamId);
        }
        if (!myTeam) {
          if (user?.role === 'admin') {
            setError("Admins don't have a team.");
          } else if (user?.role === 'captain') {
            setError("You haven't selected a team yet. Go to the Home page to select one.");
          } else {
            setError("You haven't been sold to a team yet.");
          }
        } else {
          setTeam(myTeam);
        }
      } catch (err) {
        setError('Failed to load team');
      } finally {
        setLoading(false);
      }
    };
    fetchTeam();
  }, [user]);

  const isMyTeamCaptain = user?.role === 'captain' && team;

  const handleGiveCaptaincy = async (playerId) => {
    setTransferError("");
    try {
      await api.put(`/teams/${team._id}/give-captaincy`, { playerId });
      window.location.reload();
    }
    catch (err) {
      setTransferError(err.response?.data?.message || 'Failed to transfer captaincy');
    }
  }

  const handleRelease = async (playerId) => {
    try {
      const res = await api.put(`/players/${playerId}/release`);
      setReleaseMessage(res.data.message);
      setConfirmingRelease(null);
      window.location.reload();
    }
    catch (err) {
      setReleaseMessage(err.response?.data?.message || 'Failed to release player');
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0f1e]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&display=swap');
        .font-display { font-family: 'Oswald', sans-serif; }
      `}</style>
      <Header />
      <div className="p-6 max-w-2xl mx-auto">
        {loading && (
          <div className="bg-[#0f1729] border border-white/10 rounded-2xl p-6 flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-[#f4b942] animate-pulse" />
            <p className="text-slate-400 text-sm">Loading team...</p>
          </div>
        )}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center gap-2 mt-16 px-4 py-10 rounded-2xl bg-[#0f1729] border border-white/10 border-dashed">
            <p className="text-slate-400 text-sm">{error}</p>
          </div>
        )}
        {!loading && team && (
          <div className="bg-[#0f1729] border border-white/10 rounded-2xl p-8 shadow-2xl shadow-black/40">
            <div className="flex items-center gap-3 mb-6">
              <span className="w-10 h-10 rounded-full bg-[#f4b942]/15 text-[#f4b942] font-display font-semibold flex items-center justify-center">
                {team.name?.charAt(0).toUpperCase()}
              </span>
              <div>
                <h1 className="font-display text-2xl text-white tracking-tight">{team.name}</h1>
                <p className="text-slate-500 text-sm">
                  Purse remaining: <span className="text-[#f4b942] font-display tabular-nums">₹{team.remainingPurse.toLocaleString()}</span>
                </p>
              </div>
            </div>

            <h2 className="font-display text-lg text-white tracking-tight mb-3">
              Squad ({team.players.length})
            </h2>

            {isMyTeamCaptain && (
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setShowGiveCaptaincy(!showGiveCaptaincy)}
                  className="bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs px-3 py-1.5 rounded-lg transition-colors"
                >
                  Give Captaincy
                </button>
              </div>
            )}

            {showGiveCaptaincy && (
              <div className="mb-4 bg-white/5 border border-white/10 rounded-lg p-3">
                {transferError && (
                  <p className="text-red-400 text-xs mb-2">{transferError}</p>
                )}
                <p className="text-slate-400 text-xs mb-2">Select a player to make captain:</p>
                <div className="flex flex-col gap-1">
                  {team.players.map((p) => (
                    <button
                      key={p._id}
                      onClick={() => handleGiveCaptaincy(p._id)}
                      className="text-left text-slate-300 hover:text-white text-sm px-2 py-1 rounded hover:bg-white/5"
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {team.players.length === 0 ? (
              <p className="text-slate-500 text-sm">No players yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {team.players.map((p) => (
                  <div key={p._id} className="bg-white/5 border border-white/10 rounded-lg p-3">
                    <p className="text-white font-semibold text-sm">{p.name}</p>
                    <p className="text-slate-500 text-xs capitalize">{p.role}</p>
                    {p.soldPrice && (
                      <p className="text-[#f4b942] text-xs font-display tabular-nums mt-1">₹{p.soldPrice.toLocaleString()}</p>
                    )}
                    {p.retentionPrice && (
                      <p className="text-[#f4b942] text-xs font-display tabular-nums mt-1">₹{p.retentionPrice.toLocaleString()} (retained)</p>
                    )}

                    {isMyTeamCaptain && (
                      <div className="mt-2">
                        {confirmingRelease === p._id ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleRelease(p._id)}
                              className="text-red-400 hover:text-red-300 text-xs"
                            >
                              Confirm release
                            </button>
                            <button
                              onClick={() => setConfirmingRelease(null)}
                              className="text-slate-500 hover:text-slate-400 text-xs"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmingRelease(p._id)}
                            className="text-slate-500 hover:text-red-400 text-xs"
                          >
                            Release
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
export default ViewTeam;