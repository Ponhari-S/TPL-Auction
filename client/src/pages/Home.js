import { useDispatch, useSelector } from 'react-redux';
import Header from '../components/Header';
import PlayerInfo from '../components/PlayerInfo';
import RegisterTeam from '../components/RegisterTeam';
import SelectTeam from '../components/SelectTeam';
import { updateUser } from '../features/auth/authSlice';
import api from '../api/axios';
import RetainPlayers from '../components/RetainPlayers';

const Home = () => {
  const user = useSelector((state)=>state.auth.user)
  const dispatch=useDispatch();

  const refreshUser = async ()=>{
    const res=await api.get('/auth/me');
    dispatch(updateUser(res.data));
  }

  return (
    <div className="min-h-screen bg-slate-900">
        <Header />
        <div className="p-6">
            {user.role!=='admin' && <PlayerInfo />}
            {user.role==='admin' && <RegisterTeam />}
            {user.role==='captain' && user?.team===null && (
              <SelectTeam onSelected={refreshUser}/>
            )}
            {user?.role==='captain' && user?.team!==null && <RetainPlayers />}
        </div>
    </div>
  )
}

export default Home;