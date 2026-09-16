import { useState, useEffect } from 'react';
import socket from "../socket/socket";
import Header from "../components/Header";
import api from "../api/axios";
import { useSelector } from 'react-redux';
import CountdownTimer from './CountdownTimer';
import { formatPrice } from '../utils/formatCurrency';
import OutcomeModal from '../components/OutcomeModal';

const AuctionPage = () => {
  const { user, token } = useSelector((state) => state.auth);
  const [player, setPlayer] = useState("");
  const [currentBid, setCurrentBid] = useState(0);
  const [currentBidder, setCurrentBidder] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [minIncrement, setMinIncrement] = useState(5000000);
  const [myteam, setMyteam] = useState(null);
  const [teams, setTeams] = useState(null);
  const [bidError, setBidError] = useState("");
  const [squadSize, setSquadSize] = useState(6);
  const [timerEndsAt, setTimerEndsAt] = useState(null);
  const [myTeamId, setMyTeamId] = useState(null);
  const [rtmWindow, setRtmWindow] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const [lastOutcome, setLastOutcome] = useState(null);
  const [nextValidBid, setNextValidBid] = useState(0);

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const rulesRes = await api.get('auction/rules');
        setMinIncrement(rulesRes.data.minIncrement);
        setSquadSize(rulesRes.data.squadSize);

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

  useEffect(() => {
    if (!player) return;
    api.get('/auction/next-bid').then((res) => setNextValidBid(res.data.nextBid));
  }, [player, currentBid, currentBidder]);

  const isHighestBidder = currentBidder && (
    (currentBidder._id && currentBidder._id === myTeamId) ||
    currentBidder === myTeamId
  );

  const canBid = !isHighestBidder && user?.role === 'captain' && myteam && myteam.players.length < squadSize && myteam.remainingPurse >= nextValidBid;

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
      setLastOutcome(null);
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

    socket.on('auction:paused', () => {
      setIsPaused(true);
    });

    socket.on('auction:resumed', (data) => {
      setIsPaused(false);
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
      setRtmWindow(null);
      setLastOutcome({
        type: 'sold',
        playerName: data.player.name,
        role: data.player.role,
        teamName: data.team.name,
        price: data.soldPrice
      });
    });

    socket.on('auction:ended', (data) => {
      setPlayer(null);
      setCurrentBid(0);
      setCurrentBidder(null);
      setTimerEndsAt(null);
      setLastOutcome(null);
    });

    socket.on('auction:rtmUsed', (data) => {
      setCurrentBid(data.currentBid);
      setCurrentBidder(data.currentBidder);
      setTimerEndsAt(data.timerEndsAt);
      setRtmWindow(null);
    });

    socket.on('auction:rtmWindow', (data) => {
      setRtmWindow(data);
    });

    socket.on('auction:playerUnsold', (data) => {
      setLastOutcome({
        type: 'unsold',
        playerName: data.player.name,
        role: data.player.role
      });
    });

    socket.on('auction:playerUnsoldFinal', (data) => {
      setLastOutcome({
        type: 'unsold-final',
        playerName: data.player.name,
        role: data.player.role
      });
    });

    socket.emit('auction:requestSync');

    return () => {
      socket.off('auction:playerUp');
      socket.off('auction:sync');
      socket.off('auction:bidUpdate');
      socket.off('bid:rejected');
      socket.off('auction:playerSold');
      socket.off('auction:ended');
      socket.off('auction:rtmUsed');
      socket.off('auction:rtmWindow');
      socket.off('auction:paused');
      socket.off('auction:resumed');
      socket.off('auction:playerUnsold');
      socket.off('auction:playerUnsoldFinal');
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0f1e]">
      <Header />
      <OutcomeModal outcome={lastOutcome} onClose={() => setLastOutcome(null)} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Main Auction Section */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-4">
            {!player ? (
              <div className="flex flex-col items-center justify-center gap-3 py-16 px-4 rounded-2xl bg-[#0f1729] border border-white/10 border-dashed text-center">
                <span className="w-2 h-2 rounded-full bg-slate-500" />
                <p className="text-slate-400 text-sm">No player currently up for auction.</p>
              </div>
            ) : (
              <>

                <div className="bg-[#0f1729] border border-white/10 rounded-2xl p-6 sm:p-8 lg:p-10 text-center shadow-2xl shadow-black/40">
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#22c55e]/30 bg-[#22c55e]/10 text-[#22c55e] text-xs tracking-widest uppercase font-display mb-6">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" />
                    Live
                  </span>

                  <h1 className="font-display text-3xl sm:text-4xl text-white tracking-tight mb-2">{player.name}</h1>
                  <p className="text-slate-400 capitalize mb-1">{player.role}</p>

                  {(player.pool || player.overallRating) && (
                    <div className="flex items-center justify-center gap-2 mt-2 flex-wrap">
                      {player.overallRating && (
                        <span className="bg-[#f4b942]/10 border border-[#f4b942]/30 text-[#f4b942] text-xs px-3 py-1 rounded-full tracking-wide">
                          ★ {player.overallRating}/10
                        </span>
                      )}
                      {player.pool && (
                        <span className="bg-[#f4b942]/10 border border-[#f4b942]/30 text-[#f4b942] text-xs px-3 py-1 rounded-full capitalize tracking-wide">
                          {player.pool}
                        </span>
                      )}
                    </div>
                  )}

                  {isPaused ? (
                    <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#f4b942]/30 bg-[#f4b942]/10 text-[#f4b942] text-xs uppercase tracking-widest font-display">
                      ⏸ Paused by Admin
                    </div>
                  ) : (
                    <div className="mt-4">
                      <CountdownTimer timerEndsAt={timerEndsAt} />
                    </div>
                  )}

                  <div className="mt-6 bg-[#f4b942]/5 border border-[#f4b942]/20 rounded-xl p-6">
                    <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Current Bid</p>
                    <p className="font-display text-4xl sm:text-5xl text-[#f4b942] tabular-nums">{formatPrice(currentBid)}</p>
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
                        disabled={!canBid || rtmWindow || isPaused}
                        className="w-full bg-[#f4b942] hover:bg-[#e5aa2f] disabled:opacity-40 disabled:cursor-not-allowed text-[#0a0f1e] font-display font-semibold py-3 rounded-lg text-lg tracking-wide transition-colors"
                      >
                        {isHighestBidder ? 'You are the highest bidder' : `Bid ${formatPrice(nextValidBid)}`}
                      </button>

                      {rtmWindow && myTeamId === rtmWindow.eligibleTeamId && (
                        <div className="mt-6 pt-6 border-t border-red-500/20">
                          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                            <p className="text-red-400 text-sm font-semibold text-center mb-3">
                              You previously released this player — match the bid within 5 seconds!
                            </p>
                            <CountdownTimer timerEndsAt={rtmWindow.windowEndsAt} />
                            <button
                              onClick={() => socket.emit('rtm:use', { token })}
                              className="w-full mt-3 bg-red-500 hover:bg-red-600 text-white font-display font-semibold text-sm py-2.5 rounded-lg tracking-wide transition-colors"
                            >
                              Match Bid ({formatPrice(rtmWindow.currentBid)})
                            </button>
                          </div>
                        </div>
                      )}

                      {myteam && myteam.players.length >= squadSize && (
                        <p className="text-slate-500 text-xs mt-2 text-center">Your squad is full</p>
                      )}
                      {myteam && myteam.remainingPurse < nextValidBid && (
                        <p className="text-slate-500 text-xs mt-2 text-center">Insufficient purse for next bid</p>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-8 text-left">
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
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 col-span-2 sm:col-span-1">
                      <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Strike Rate</p>
                      <p className="font-display text-xl text-white tabular-nums">{player.stats.strikeRate}</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Teams Section */}
          <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-4 lg:sticky lg:top-24 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto pr-1">
            <div className="flex items-center justify-between pb-1 border-b border-white/10">
              <h2 className="font-display text-xl text-white tracking-tight">Teams</h2>
              {teams && teams.length > 0 && (
                <span className="text-slate-500 text-xs font-medium bg-white/5 px-2.5 py-0.5 rounded-full border border-white/10">{teams.length} Franchises</span>
              )}
            </div>

            {!teams || teams.length === 0 ? (
              <div className="flex items-center justify-center px-4 py-8 rounded-xl bg-[#0f1729] border border-white/10 border-dashed">
                <p className="text-slate-500 text-sm">No teams to show yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3.5">
                {teams.map((team) => {
                  const isMyTeam = user?.role === 'admin' || (myTeamId && team._id === myTeamId);
                  return (
                    <div
                      key={team._id}
                      className={`rounded-xl p-4 border transition-all ${isMyTeam
                        ? "bg-[#f4b942]/5 border-[#f4b942]/30 shadow-lg shadow-black/20"
                        : "bg-[#0f1729] border-white/10"
                        }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="shrink-0 w-8 h-8 rounded-full bg-[#f4b942]/15 text-[#f4b942] font-display font-semibold text-xs flex items-center justify-center">
                            {team.name?.charAt(0).toUpperCase()}
                          </span>
                          <p className="text-white font-semibold text-sm truncate">{team.name}</p>
                        </div>
                        {isMyTeam && (
                          <span className="shrink-0 text-[#f4b942] text-[10px] uppercase tracking-wider font-display bg-[#f4b942]/10 px-2 py-0.5 rounded-full border border-[#f4b942]/30">
                            Yours
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-400 mt-2">
                        <span>Purse: <span className="text-[#f4b942] font-display tabular-nums">{formatPrice(team.remainingPurse)}</span></span>
                        <span>Squad: <span className="text-white tabular-nums">{team.players.length}/{squadSize}</span></span>
                      </div>

                      {team.players.length === 0 ? (
                        <p className="text-slate-600 text-xs italic pt-2 mt-2 border-t border-white/5">No players acquired yet</p>
                      ) : (
                        <ul className="border-t border-white/10 pt-2.5 mt-2.5 space-y-1 max-h-32 overflow-y-auto pr-1">
                          {team.players.map((p) => (
                            <li key={p._id} className="text-slate-400 text-xs flex justify-between gap-2 truncate">
                              <span className="truncate">{p.name}</span>
                              <span className="text-slate-600 capitalize shrink-0">{p.role}</span>
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
      </main>
    </div>
  )
}

export default AuctionPage;