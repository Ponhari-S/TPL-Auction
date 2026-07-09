import Auth from "./pages/Auth";
import { useSelector } from "react-redux";
import { BrowserRouter,Routes,Route,Navigate } from "react-router-dom";

const ProtectedRoute = ({children}) =>{
  const {token}=useSelector((state)=>state.auth);
  return token ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={
          useSelector((state)=>state.auth.token) ? <Navigate to="/" /> : <Auth />
        } />
        <Route path="/" element={<ProtectedRoute>
          <div className="min-h-screen flex items-center justify-center bg-slate-900">
                <h1 className="text-3xl font-bold text-white">
                  Logged in — Home page coming Day 15
                </h1>
          </div>
        </ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
