import { useSelector } from 'react-redux';
import Header from '../components/Header';
import PlayerInfo from '../components/PlayerInfo';
import RegisterTeam from '../components/RegisterTeam';

const Home = () => {
  const user = useSelector((state)=>state.auth.user)
  return (
    <div className="min-h-screen bg-slate-900">
        <Header />
        <div className="p-6">
            {user.role==='player' && <PlayerInfo />}
            {user.role==='admin' && <RegisterTeam />}
        </div>
    </div>
  )
}

export default Home;