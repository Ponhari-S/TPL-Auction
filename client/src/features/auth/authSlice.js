import {createSlice} from '@reduxjs/toolkit';

const storedUser = localStorage.getItem('user');
const storedToken = localStorage.getItem('token');

const authSlice=createSlice({
    name:'auth',
    initialState:{
        user: storedUser ? JSON.parse(storedUser) : null,
        token: storedToken || null,
    },
    reducers:{
        setCredentials:(state,action)=>{
            state.user=action.payload.user;
            state.token=action.payload.token;
            localStorage.setItem('user',JSON.stringify(action.payload.user));
            localStorage.setItem('token',action.payload.token);
        },
        logout:(state)=>{
            state.user=null;
            state.token=null;
            localStorage.removeItem('user');
            localStorage.removeItem('token');
        },
        updateUser:(state,action)=>{
            state.user=action.payload;
            localStorage.setItem('user', JSON.stringify(action.payload));
        }
    }
});

export const {setCredentials,logout,updateUser}=authSlice.actions;
export default authSlice.reducer;