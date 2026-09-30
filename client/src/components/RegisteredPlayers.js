import {useState,useEffect} from 'react'
import api from '../api/axios'

const RegisteredPlayers = () => {
    const [players,setPlayers] = useState([]);
    const [error,setError] = useState('');
    
    useEffect(()=>{
        api.get('/players/registered/all')
        .then((res)=>setPlayers(res.data))
        .catch(()=>setError('Failed to load players'));
    },[]);

  return (
    <div className="bg-[#0f1729] border border-white/10 rounded-2xl p-6">
      <h2 className="font-display text-lg text-white mb-4">
        Registered Players ({players.length})
      </h2>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <div className="flex flex-col gap-2 max-h-96 overflow-y-auto">
        {players.map((p) => (
          <div key={p._id} className="flex items-center justify-between bg-white/5 border border-white/10 rounded-lg px-4 py-2">
            <div>
              <span className="text-white text-sm font-semibold">{p.name}</span>
            </div>
            <div className="flex items-center gap-2">
              {p.pool && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#f4b942]/10 text-[#f4b942] capitalize">
                  {p.pool}
                </span>
              )}
              <span className="text-white text-sm font-display">
                {p.overallRating ? `★ ${p.overallRating}` : '—'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default RegisteredPlayers;