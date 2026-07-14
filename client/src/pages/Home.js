import { useSelector } from 'react-redux';
import Header from '../components/Header';
import PlayerInfo from '../components/PlayerInfo';
import RegisterTeam from '../components/RegisterTeam';
import SelectTeam from '../components/SelectTeam';

const Home = () => {
  const user = useSelector((state)=>state.auth.user)
  return (
    <div className="min-h-screen bg-slate-900">
        <Header />
        <div className="p-6">
            {user.role!=='admin' && <PlayerInfo />}
            {user.role==='admin' && <RegisterTeam />}
            {user.role==='captain' && !user?.team && (
              <SelectTeam onSelected={()=>window.location.reload()}/>
            )}
        </div>
    </div>
  )
}

export default Home;