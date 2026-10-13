import Auth from "./pages/Auth";
import { useSelector,useDispatch } from "react-redux";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import ViewTeam from "./pages/ViewTeam";
import AdminDashboard from "./pages/AdminDashboard";
import AuctionPage from "./pages/AuctionPage";
import { useEffect } from "react";
import socket from "./socket/socket";
import SummaryPage from "./pages/SummaryPage";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from './pages/ResetPassword';
import api from './api/axios';
import { updateUser } from './features/auth/authSlice';

const ProtectedRoute = ({ children }) => {
  const { token } = useSelector((state) => state.auth);

  return token ? children : <Navigate to="/login" />;
}

function App() {
  const { token } = useSelector((state) => state.auth);
  const dispatch=useDispatch();
  useEffect(() => {
    if (token) {
      socket.connect();
    }
    return () => {
      socket.disconnect();
    };
  }, [token]);

  useEffect(() => {
    if (!token) return;
    const refresh = () => {
        api.get('/auth/me').then((res) => dispatch(updateUser(res.data))).catch(() => {});
    };
    refresh();
    window.addEventListener('focus', refresh);
    return () => window.removeEventListener('focus', refresh);
}, [token, dispatch]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={
          useSelector((state) => state.auth.token) ? <Navigate to="/" /> : <Auth />
        } />
        <Route path="/" element={<ProtectedRoute>
          <Home />
        </ProtectedRoute>} />
        <Route path="/view-team" element={
          <ProtectedRoute>
            <ViewTeam />
          </ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/auction" element={
          <ProtectedRoute>
            <AuctionPage />
          </ProtectedRoute>
        } />
        <Route path="/summary" element={
          <ProtectedRoute>
            <SummaryPage />
          </ProtectedRoute>
        } />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
