import {createSlice} from "@reduxjs/toolkit";
import Pagin1 from "../assets/img/pagin1.png";
import Pagin2 from "../assets/img/pagin2.png";
import Pagin3 from "../assets/img/pagin3.png";

const initialState = {
    isActivePopup: false,
    isNotFound: false,
    orders: [],
    generalOrderId: null,
    fabricsAll: [],
    userProduct: {
        images: [Pagin1, Pagin2, Pagin3],
        id: '300SH (бязь)'
    },
    test: {
        image: '',
        fabricType: 'Котон',
        number: 'AZ_004',
        remainderA: 8,
        remainderB: 40,
        serial: ['A'],
    },
};

export const mainSlice = createSlice({
    name: 'mainPage',
    initialState,
    reducers: {
        setIsActivePopup(state, {payload}) {
            state.isActivePopup = payload;
            state.isActivePopup ? document.body.style.overflow = "hidden" : document.body.style.overflow = "auto";
        },
        setOrders(state, {payload}) {
            state.orders = payload;
        },
        updateOrders(state, {payload}) {
            state.orders = [payload, ...state.orders]
        },
        removeStateOrder(state, {payload}) {
            state.orders = state.orders.filter((item) => item.id !== payload);
        },
        setFabricsList(state, {payload}) {
            state.fabricsAll = payload;
        },
        setIsNotFound(state, {payload}) {
            state.isNotFound = payload;
        },
        setGeneralOrderId(state, { payload }) {
            state.generalOrderId = payload;
        }
    },
})

export default mainSlice.reducer;

export const {
    setIsActivePopup,
    setOrders,
    removeStateOrder,
    updateOrders,
    setFabricsList,
    setIsNotFound,
    setGeneralOrderId
} = mainSlice.actions;
