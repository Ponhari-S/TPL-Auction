import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import Header from '../components/Header';
import api from '../api/axios';

function ViewTeam() {
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