import { Navigate } from 'react-router-dom';
import Header from '../components/Header';
import { useSelector } from 'react-redux';
import AuctionRules from '../components/AuctionRules';
import BuildQueue from '../components/BuildQueue';
import AuctionControls from '../components/AuctionControls';
import PendingTrades from '../components/PendingTrades';
import AddPlayer from '../components/AddPlayer';

const AdminDashboard = () => {
    const user = useSelector((state)=>state.auth.user);
    if(user?.role!=='admin'){
        return(
            <Navigate to='/' />
        )
    }
  return (
    <div className="min-h-screen bg-slate-900">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-white/10">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl text-white tracking-tight">Admin Dashboard</h1>
            <p className="text-slate-500 text-sm mt-1">Manage auction rules, player roster, queue, and approvals.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          <div className="lg:col-span-5 flex flex-col gap-6">
            <AuctionControls />
            <BuildQueue />
            <PendingTrades />
          </div>

          <div className="lg:col-span-7 flex flex-col gap-6">
            <AuctionRules />
            <AddPlayer />
          </div>
        </div>
      </main>
    </div>
  )
}

export default AdminDashboard;