import { Navigate } from 'react-router-dom';
import Header from '../components/Header';
import { useSelector } from 'react-redux';
import AuctionRules from '../components/AuctionRules';
import BuildQueue from '../components/BuildQueue';
import AuctionControls from '../components/AuctionControls';

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
      <div className="p-6">
        <h1 className="text-2xl font-bold text-white mb-6">Admin Dashboard</h1>
        <AuctionRules />
        <BuildQueue />
        <AuctionControls />
      </div>
    </div>
  )
}

export default AdminDashboard;