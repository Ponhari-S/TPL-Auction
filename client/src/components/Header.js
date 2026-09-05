import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../features/auth/authSlice'
import { Link,useNavigate } from 'react-router-dom';

const Header = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth)
    const [menuOpen, setMenuOpen] = useState(false);
    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    }
  return (
    <header className="sticky top-0 z-20 bg-[#0a0f1e]/95 backdrop-blur border-b border-white/10 px-4 sm:px-6 py-3 sm:py-4">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&display=swap');
        .font-display { font-family: 'Oswald', sans-serif; }
      `}</style>

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#f4b942] animate-pulse" />
          <h1 className="font-display text-lg sm:text-xl font-semibold text-white tracking-wide">
            TPL <span className="text-[#f4b942]">Auction</span>
          </h1>
        </div>

        <nav className="hidden lg:flex items-center gap-1 bg-white/5 border border-white/10 rounded-full p-1">
          <Link
            to="/"
            className="px-4 py-1.5 rounded-full text-sm font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            Home
          </Link>
          <Link
            to="/view-team"
            className="px-4 py-1.5 rounded-full text-sm font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            View Team
          </Link>
          {user?.role === 'admin' && (
          <Link to="/admin" className="px-4 py-1.5 rounded-full text-sm font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            Admin Dashboard
          </Link>
          )}
          <Link to="/auction" className="px-4 py-1.5 rounded-full text-sm font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            Auction Live
          </Link>
          <Link to="/summary" className="px-4 py-1.5 rounded-full text-sm font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            Summary
          </Link>
        </nav>

        <div className="flex items-center gap-3 sm:gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
            <span className="w-6 h-6 rounded-full bg-[#f4b942]/20 text-[#f4b942] text-xs font-semibold flex items-center justify-center">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
            <span className="text-slate-300 text-sm">
              {user?.name} <span className="text-slate-500 capitalize">({user?.role})</span>
            </span>
          </div>

          <span className="sm:hidden text-slate-300 text-xs max-w-[70px] truncate">
            {user?.name}
          </span>

          <button
            onClick={handleLogout}
            className="bg-red-600/90 hover:bg-red-600 text-white text-xs sm:text-sm font-medium px-3 py-1.5 rounded-lg transition-colors"
          >
            Logout
          </button>

          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle navigation menu"
            className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:text-white transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              {menuOpen ? (
                <path d="M2 2L14 14M14 2L2 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              ) : (
                <path d="M2 4H14M2 8H14M2 12H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="lg:hidden mt-3 pt-3 border-t border-white/10 flex flex-col gap-1">
          <Link
            to="/"
            onClick={() => setMenuOpen(false)}
            className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            Home
          </Link>
          <Link
            to="/view-team"
            onClick={() => setMenuOpen(false)}
            className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            View Team
          </Link>
          {user?.role === 'admin' && (
          <Link
            to="/admin"
            onClick={() => setMenuOpen(false)}
            className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            Admin Dashboard
          </Link>
          )}
          <Link
            to="/auction"
            onClick={() => setMenuOpen(false)}
            className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            Auction Live
          </Link>
          <Link
            to="/summary"
            onClick={() => setMenuOpen(false)}
            className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            Summary
          </Link>
        </nav>
      )}
    </header>
  )
}

export default Header