import {useState} from 'react'
import api from "../api/axios"

const ForgotPassword = () => {
    const [message,setMessage] = useState("");
    const [email,setEmail] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        try{
            const res= await api.post('/auth/forgot-password',{email});
            setMessage(res.data.message);
        }
        catch(err){
            setMessage(err.response?.data?.message || 'Something went wrong');
        }
    };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0f1e]">
      <div className="bg-[#0f1729] border border-white/10 p-8 rounded-2xl w-96">
        <h2 className="font-display text-xl text-white mb-4">Reset Password</h2>
        {message && <p className="text-green-400 text-sm mb-3">{message}</p>}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="email"
            placeholder="Your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="p-2 rounded bg-white/5 border border-white/10 text-white text-sm"
            required
          />
          <button
            type="submit"
            className="bg-[#f4b942] hover:bg-[#e5aa2f] text-[#0a0f1e] font-display font-semibold text-sm py-2 rounded-lg"
          >
            Send Reset Link
          </button>
        </form>
      </div>
    </div>
  )
}

export default ForgotPassword;