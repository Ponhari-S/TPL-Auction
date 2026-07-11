import Auth from "./pages/Auth";
import { useSelector } from "react-redux";
import { BrowserRouter,Routes,Route,Navigate } from "react-router-dom";
import Home from "./pages/Home";

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
          <Home />
        </ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
