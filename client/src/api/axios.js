import axios from 'axios';
import store from '../app/Store';
import { logout } from '../features/auth/authSlice';

const api=axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api'
});

api.interceptors.request.use((config)=>{
    const token=localStorage.getItem('token');
    if(token){
        config.headers.Authorization=`Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const url = error.config?.url || '';
        const isAuthCall = ['/auth/login', '/auth/signup', '/auth/forgot-password', '/auth/reset-password'].some((p) => url.includes(p));
        if (error.response?.status === 401 && !isAuthCall) {
            store.dispatch(logout());
        }
        return Promise.reject(error);
    }
);

export default api;
