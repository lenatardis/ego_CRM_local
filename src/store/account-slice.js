import {createSlice} from "@reduxjs/toolkit";
import userPhoto from '../assets/icons/user.svg';
import { removeAuthTokens } from "../utils/authTokens";

const initialState = {
    isAuth: false,
    user: {
        name: '',
        photo: userPhoto,
        id: null,
        url: null,
    },
};

export const accountSlice = createSlice({
    name: 'accountPage',
    initialState,
    reducers: {
        login(state, action) {
            state.isAuth = true;
            state.user = {
                name: action.payload.first_name,
                photo: action.payload.photo ? action.payload.photo : userPhoto,
                id: action.payload.id,
                url: action.payload.url
            }
        },
        logout: () => {
            removeAuthTokens();
            return initialState;
        },
    }
})

export default accountSlice.reducer;

export const {
    login,
    logout
} = accountSlice.actions;