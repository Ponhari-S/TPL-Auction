import Header from '../components/Header';
import PlayerInfo from '../components/PlayerInfo';

const Home = () => {
  return (
    <div className="min-h-screen bg-slate-900">
        <Header />
        <div className="p-6">
            <PlayerInfo />
        </div>
    </div>
  )
}

export default Home;