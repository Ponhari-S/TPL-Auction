import { useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setCredentials } from "../features/auth/authSlice";
import { useNavigate } from "react-router-dom";

const Auth = () => {
  const dispatch=useDispatch();
  const navigate=useNavigate();
  const [isSignUp, setIsSignUp] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    stumps: "",
    email: "",
    password: "",
    role: "player"
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const endpoint = isSignUp ? "api/auth/signup" : "api/auth/login";
      const payload = isSignUp ? formData : { email: formData.email, password: formData.password };
      const res = await axios.post(`http://localhost:5000/${endpoint}`, payload);
      
      if(isSignUp){
        console.log("SignedUp:",res.data);
        setIsSignUp(false);
      }
      else{
        dispatch(setCredentials({ user: res.data.user,token: res.data.token}));
        navigate("/");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0a0f1e] flex flex-col lg:flex-row">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap');
        .font-display { font-family: 'Oswald', sans-serif; }
        .font-body { font-family: 'Inter', sans-serif; }
      `}</style>

      <div className="relative lg:w-[46%] px-6 py-10 sm:px-10 lg:px-14 lg:py-16 flex flex-col justify-between overflow-hidden bg-gradient-to-br from-[#0d1526] via-[#0a0f1e] to-[#0a1f14] font-body">
        <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-[#22c55e]/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-[#f4b942]/10 blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#f4b942]/30 bg-[#f4b942]/10 text-[#f4b942] text-xs tracking-widest uppercase font-display">
            <span className="w-1.5 h-1.5 rounded-full bg-[#f4b942] animate-pulse" />
            TPL Auction
          </span>

          <h1 className="font-display text-4xl sm:text-5xl lg:text-[3.4rem] leading-[1.05] text-white mt-6 tracking-tight">
            Bid. Build.<br />
            <span className="text-[#f4b942]">Own the Squad.</span>
          </h1>

          <p className="text-slate-400 mt-5 max-w-sm text-[15px] leading-relaxed">
            Step into the auction floor. Track player stats, place live bids, and assemble a franchise that dominates the season.
          </p>
        </div>

        <div className="relative z-10 hidden lg:flex items-center gap-8 mt-12 pt-8 border-t border-white/10">
          <div>
            <p className="font-display text-2xl text-white tabular-nums">24</p>
            <p className="text-xs text-slate-500 uppercase tracking-wider mt-1">Players</p>
          </div>
          <div>
            <p className="font-display text-2xl text-white tabular-nums">04</p>
            <p className="text-xs text-slate-500 uppercase tracking-wider mt-1">Franchises</p>
          </div>
          <div>
            <p className="font-display text-2xl text-[#22c55e] tabular-nums">LIVE</p>
            <p className="text-xs text-slate-500 uppercase tracking-wider mt-1">Bidding Status</p>
          </div>
        </div>

        <svg
          className="hidden lg:block absolute top-0 right-0 h-full w-6 pointer-events-none"
          viewBox="0 0 24 800"
          preserveAspectRatio="none"
        >
          <line x1="12" y1="0" x2="12" y2="800" stroke="#f4b942" strokeOpacity="0.25" strokeWidth="1" />
          {Array.from({ length: 40 }).map((_, i) => (
            <line
              key={i}
              x1="4"
              y1={i * 20 + 6}
              x2="20"
              y2={i * 20 + 14}
              stroke="#f4b942"
              strokeOpacity="0.35"
              strokeWidth="1.5"
            />
          ))}
        </svg>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-10 sm:px-10 lg:px-16 lg:py-6 font-body">
        <div className="w-full max-w-md">
          <div className="flex bg-white/5 border border-white/10 rounded-xl p-1 mb-8 lg:mb-5">
            <button
              type="button"
              onClick={() => setIsSignUp(true)}
              className={`flex-1 py-2.5 lg:py-2 rounded-lg text-sm font-semibold transition-all ${
                isSignUp ? "bg-[#f4b942] text-[#0a0f1e]" : "text-slate-400 hover:text-white"
              }`}
            >
              Sign Up
            </button>
            <button
              type="button"
              onClick={() => setIsSignUp(false)}
              className={`flex-1 py-2.5 lg:py-2 rounded-lg text-sm font-semibold transition-all ${
                !isSignUp ? "bg-[#f4b942] text-[#0a0f1e]" : "text-slate-400 hover:text-white"
              }`}
            >
              Sign In
            </button>
          </div>

          <div className="bg-[#0f1729] border border-white/10 rounded-2xl p-6 sm:p-8 lg:p-6 shadow-2xl shadow-black/40">
            <h2 className="font-display text-2xl lg:text-xl text-white mb-1">
              {isSignUp ? "Create your account" : "Welcome back"}
            </h2>
            <p className="text-slate-500 text-sm mb-6 lg:mb-4">
              {isSignUp ? "Join the auction and start building your squad." : "Sign in to get back to the auction room."}
            </p>

            {error && (
              <div className="mb-5 lg:mb-3 px-4 py-3 lg:py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4 lg:gap-2.5">
              {isSignUp && (
                <div>
                  <label className="text-xs text-slate-400 uppercase tracking-wider mb-1.5 lg:mb-1 block">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Virat Kohli"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 lg:py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-slate-600 outline-none focus:border-[#f4b942] focus:ring-1 focus:ring-[#f4b942] transition-colors"
                    required
                  />
                </div>
              )}

              {isSignUp && (
                <div>
                  <label className="text-xs text-slate-400 uppercase tracking-wider mb-1.5 lg:mb-1 block">Stumps ID</label>
                  <input
                    type="text"
                    name="stumpsId"
                    placeholder="Your Stumps profile ID"
                    value={formData.stumpsId}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 lg:py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-slate-600 outline-none focus:border-[#f4b942] focus:ring-1 focus:ring-[#f4b942] transition-colors"
                    required
                  />
                </div>
              )}

              <div>
                <label className="text-xs text-slate-400 uppercase tracking-wider mb-1.5 lg:mb-1 block">Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 lg:py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-slate-600 outline-none focus:border-[#f4b942] focus:ring-1 focus:ring-[#f4b942] transition-colors"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 uppercase tracking-wider mb-1.5 lg:mb-1 block">Password</label>
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 lg:py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-slate-600 outline-none focus:border-[#f4b942] focus:ring-1 focus:ring-[#f4b942] transition-colors"
                  required
                />
              </div>

              {isSignUp && (
                <div>
                  <label className="text-xs text-slate-400 uppercase tracking-wider mb-1.5 lg:mb-1 block">Role</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 lg:py-2 rounded-lg bg-white/5 border border-white/10 text-white outline-none focus:border-[#f4b942] focus:ring-1 focus:ring-[#f4b942] transition-colors"
                  >
                    <option value="player" className="bg-[#0f1729]">Player</option>
                    <option value="captain" className="bg-[#0f1729]">Captain</option>
                    <option value="admin" className="bg-[#0f1729]">Admin</option>
                  </select>
                </div>
              )}

              <button
                type="submit"
                className="mt-2 lg:mt-1 bg-[#f4b942] hover:bg-[#e5aa2f] text-[#0a0f1e] font-display font-semibold text-[15px] tracking-wide py-3 lg:py-2.5 rounded-lg transition-colors"
              >
                {isSignUp ? "Sign Up" : "Sign In"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;