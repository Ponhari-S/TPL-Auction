import { Navigate } from 'react-router-dom';
import Header from '../components/Header';
import { useSelector } from 'react-redux';

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
        <p className="text-slate-400">Auction controls coming soon.</p>
      </div>
    </div>
  )
}

export default AdminDashboard;