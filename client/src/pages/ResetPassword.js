import {useState,useEffect} from 'react'
import { useNavigate,useParams } from 'react-router-dom';
import api from '../api/axios';

const ResetPassword = () => {
    const [message,setMessage] = useState('');
    const [error,setError] = useState('');
    const [password,setPassword] = useState('');
    const navigate = useNavigate();
    const {token} = useParams();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        try{
            await api.post(`/auth/reset-password/${token}`,{password});
            setMessage('Password reset — redirecting to login...');
            setTimeout(()=> navigate('/login'),2000);
        }
        catch(err){
            setError(err.response?.data?.message || 'Failed to reset password');
        }
    }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0f1e]">
      <div className="bg-[#0f1729] border border-white/10 p-8 rounded-2xl w-96">
        <h2 className="font-display text-xl text-white mb-4">Set New Password</h2>
        {message && <p className="text-green-400 text-sm mb-3">{message}</p>}
        {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="password"
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="p-2 rounded bg-white/5 border border-white/10 text-white text-sm"
            required
          />
          <button
            type="submit"
            className="bg-[#f4b942] hover:bg-[#e5aa2f] text-[#0a0f1e] font-display font-semibold text-sm py-2 rounded-lg"
          >
            Reset Password
          </button>
        </form>
      </div>
    </div>
  )
}

export default ResetPassword;