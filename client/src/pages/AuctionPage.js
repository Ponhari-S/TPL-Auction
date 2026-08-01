import { useState, useEffect } from 'react';
import socket from "../socket/socket";
import Header from "../components/Header";
import api from "../api/axios";
import { useSelector } from 'react-redux';
import CountdownTimer from './CountdownTimer';

const AuctionPage = () => {
    const { user, token } = useSelector((state) => state.auth);
    const [player, setPlayer] = useState("");
    const [currentBid, setCurrentBid] = useState(0);
    const [currentBidder, setCurrentBidder] = useState(null);
    const [minIncrement, setMinIncrement] = useState(5000000);
    const [myteam, setMyteam] = useState(null);
    const [teams, setTeams] = useState(null);
    const [bidError, setBidError] = useState("");
    const [squadSize, setSquadSize] = useState(6);
    const [timerEndsAt, setTimerEndsAt] = useState(null);
    const [myTeamId, setMyTeamId] = useState(null);

    useEffect(() => {
      const fetchInfo = async () => {
        try {
          const rulesRes = await api.get('auction/rules');
          setMinIncrement(rulesRes.data.minIncrement);
          setSquadSize(6);

          const teamRes = await api.get('/teams');
          setTeams(teamRes.data);

          if (user?.role === 'captain') {
            const team = teamRes.data.find((t) => t.captain._id === user._id || t.captain === user._id);
            setMyteam(team || null);
            setMyTeamId(team._id || null);
          }
          if (user?.role === 'player') {
            const profileRes = await api.get('/players/me/profile');
            setMyTeamId(profileRes.data.soldTo || profileRes.data.retainedBy || null);
          }
        }
        catch (err) {
          console.error('Failed to fetch auction/team info', err);
        }
      }
      fetchInfo();
    }, [user]);

    const nextValidBid = currentBid + minIncrement;
    const canBid = user?.role === 'captain' && myteam && myteam.players.length < squadSize && myteam.remainingPurse >= nextValidBid;

    const handleBid = () => {
      setBidError('');
      socket.emit('bid:place', { token, amount: nextValidBid });
    }

    useEffect(() => {
        socket.on('auction:playerUp', (data) => {
            setPlayer(data.player);
            setCurrentBid(data.currentBid);
            setCurrentBidder(null);
            setTimerEndsAt(data.timerEndsAt);
        });

        socket.on('auction:sync', (data) => {
            if (data.status === 'live') {
                setPlayer(data.player);
                setCurrentBid(data.currentBid);
                setCurrentBidder(data.currentBidder);
                setTimerEndsAt(data.timerEndsAt);
            }
        });

        socket.on('auction:bidUpdate', (data) => {
          setCurrentBid(data.currentBid);
          setCurrentBidder(data.currentBidder);
          setTimerEndsAt(data.timerEndsAt);
        });

        socket.on('bid:rejected', (data) => {
          setBidError(data.message);
        });

        socket.on('auction:playerSold', (data) => {
          setTeams((prevTeams) =>
            prevTeams
              ? prevTeams.map((t) =>
                  t._id === data.team._id
                    ? { ...t, remainingPurse: t.remainingPurse - data.soldPrice, players: [...t.players, data.player] }
                    : t
                )
              : prevTeams
          );
          setMyteam((prev) =>
            prev && prev._id === data.team._id
              ? { ...prev, remainingPurse: prev.remainingPurse - data.soldPrice, players: [...prev.players, data.player] }
              : prev
          );
        });

        socket.on('auction:ended', (data) => {
          setPlayer(null);
          setCurrentBid(0);
          setCurrentBidder(null);
          setTimerEndsAt(null);
        })

        socket.emit('auction:requestSync');

        return () => {
            socket.off('auction:playerUp');
            socket.off('auction:sync');
            socket.off('auction:bidUpdate');
            socket.off('bid:rejected');
            socket.off('auction:playerSold');
            socket.off('auction:ended');
        };
    }, []);

  return (
    <div className="min-h-screen bg-[#0a0f1e]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&display=swap');
        .font-display { font-family: 'Oswald', sans-serif; }
      `}</style>
      <Header />
      <div className="p-6 max-w-2xl mx-auto">
        {!player ? (
          <div className="flex flex-col items-center justify-center gap-3 mt-16 px-4 py-10 rounded-2xl bg-[#0f1729] border border-white/10 border-dashed">
            <span className="w-2 h-2 rounded-full bg-slate-500" />
            <p className="text-slate-400 text-sm">No player currently up for auction.</p>
          </div>
        ) : (
          <div className="bg-[#0f1729] border border-white/10 rounded-2xl p-8 sm:p-10 text-center shadow-2xl shadow-black/40">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#22c55e]/30 bg-[#22c55e]/10 text-[#22c55e] text-xs tracking-widest uppercase font-display mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" />
              Live
            </span>

            <h1 className="font-display text-3xl sm:text-4xl text-white tracking-tight mb-2">{player.name}</h1>
            <p className="text-slate-400 capitalize mb-1">{player.role}</p>
            {player.pool && (
              <span className="inline-block bg-[#f4b942]/10 border border-[#f4b942]/30 text-[#f4b942] text-xs px-3 py-1 rounded-full capitalize mt-2 tracking-wide">
                {player.pool}
              </span>
            )}
            {player.overallRating && (
              <span className="inline-block bg-[#f4b942]/10 border border-[#f4b942]/30 text-[#f4b942] text-xs px-3 py-1 rounded-full capitalize mt-2 tracking-wide">
                ★ {player.overallRating}/10
              </span>
            )}
            <CountdownTimer timerEndsAt={timerEndsAt} />
            <div className="mt-6 bg-[#f4b942]/5 border border-[#f4b942]/20 rounded-xl p-6">
              <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Current Bid</p>
              <p className="font-display text-4xl text-[#f4b942] tabular-nums">₹{currentBid.toLocaleString()}</p>
              <p className="text-slate-400 text-sm mt-3">
                {currentBidder ? (
                  <>Leading: <span className="text-white font-semibold">{currentBidder.name}</span></>
                ) : (
                  'No bids yet'
                )}
              </p>
            </div>

            {user?.role === 'captain' && (
              <div className="mt-6 pt-6 border-t border-white/10">
                {bidError && (
                  <div className="mb-3 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                    {bidError}
                  </div>
                )}
                <button
                  onClick={handleBid}
                  disabled={!canBid}
                  className="w-full bg-[#f4b942] hover:bg-[#e5aa2f] disabled:opacity-40 disabled:cursor-not-allowed text-[#0a0f1e] font-display font-semibold py-3 rounded-lg text-lg tracking-wide transition-colors"
                >
                Bid ₹{nextValidBid.toLocaleString()}
                </button>
                {myteam && myteam.players.length >= squadSize && (
                  <p className="text-slate-500 text-xs mt-2 text-center">Your squad is full</p>
                )}
                {myteam && myteam.remainingPurse < nextValidBid && (
                  <p className="text-slate-500 text-xs mt-2 text-center">Insufficient purse for next bid</p>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-8 text-left">
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Matches</p>
                <p className="font-display text-xl text-white tabular-nums">{player.stats.matches}</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Runs</p>
                <p className="font-display text-xl text-white tabular-nums">{player.stats.runs}</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Wickets</p>
                <p className="font-display text-xl text-white tabular-nums">{player.stats.wickets}</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Average</p>
                <p className="font-display text-xl text-[#f4b942] tabular-nums">{player.stats.average}</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Strike Rate</p>
                <p className="font-display text-xl text-white tabular-nums">{player.stats.strikeRate}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-6 max-w-2xl mx-auto">
        <h2 className="font-display text-xl text-white tracking-tight mb-4">Teams</h2>
        {!teams || teams.length === 0 ? (
          <div className="flex items-center justify-center px-4 py-6 rounded-xl bg-[#0f1729] border border-white/10 border-dashed">
            <p className="text-slate-500 text-sm">No teams to show yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {teams.map((team) => {
              const isMyTeam = user?.role === 'admin' || (myTeamId && team._id === myTeamId);
              return (
                <div
                  key={team._id}
                  className={`rounded-xl p-4 border ${
                    isMyTeam
                      ? "bg-[#f4b942]/5 border-[#f4b942]/30"
                      : "bg-[#0f1729] border-white/10"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="shrink-0 w-7 h-7 rounded-full bg-[#f4b942]/15 text-[#f4b942] font-display font-semibold text-xs flex items-center justify-center">
                        {team.name?.charAt(0).toUpperCase()}
                      </span>
                      <p className="text-white font-semibold text-sm truncate">{team.name}</p>
                    </div>
                    {isMyTeam && (
                      <span className="shrink-0 text-[#f4b942] text-[10px] uppercase tracking-wider font-display">
                        Yours
                      </span>
                    )}
                  </div>

                  <p className="text-slate-400 text-xs">
                    Purse: <span className="text-[#f4b942] font-display tabular-nums">₹{team.remainingPurse.toLocaleString()}</span>
                  </p>
                  <p className="text-slate-500 text-xs mt-1 mb-2">
                    Squad: <span className="tabular-nums">{team.players.length}/{squadSize}</span>
                  </p>

                  {team.players.length > 0 && (
                    <ul className="border-t border-white/10 pt-2 mt-2 space-y-1">
                      {team.players.map((p) => (
                        <li key={p._id} className="text-slate-400 text-xs truncate">
                          {p.name} <span className="text-slate-600 capitalize">({p.role})</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default AuctionPage;