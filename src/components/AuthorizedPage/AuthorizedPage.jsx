import React from "react";
import {Route, Routes, useLocation} from "react-router-dom";
import Main from "./Main/Main";
import MainMenu from "../Navigations/MainMenu";
import Fabrics from "./Fabrics/Fabrics";
import Fabric from "../UserPage/Fabric";
import Products from "./Products/Products";
import DeliveryUKR from "./DeliveryUKR/DeliveryUKR";
import OrderStatus from "./OrderStatus/OrderStatus";
import Calculator from "./Calculator/Calculator";
import OrderWrapper from "./OrderCreate/OrderWrapper";
import DeliveryNPWrapper from "./DeliveryNP/DeliveryNPWrapper";
import Storage from "./Storage/Storage";
import { useAppSelector } from "../../hooks/redux";
import { getIsNotFound } from "../../store/selectors";
import Profile from "./Profile/Profile";

const AuthorizedPage = () => {
    const { pathname } = useLocation();
    const isNotFound = useAppSelector(getIsNotFound);

    return (
        <>
            <Routes>
                <Route path={'/*'} element={<Main />} />
                <Route path={'/fabrics/'} element={<Fabrics />} />
                <Route path={`/fabrics/:id`} element={<Fabrics />} />
                <Route path={'/storage/'} element={<Storage />} />
                <Route path={'/storage/:id'} element={<Storage />} />
                <Route path={'/order/:id/*'} element={<OrderWrapper />} />
                <Route path={'/products/:id/*'} element={<Products />} />
                <Route path={'/deliveryNP/:id/*'} element={<DeliveryNPWrapper />} />
                <Route path={'/deliveryUKR/:id/*'} element={<DeliveryUKR />} />
                <Route path={'/order_status/:id/*'} element={<OrderStatus />} />
                <Route path={'/calculator/:orderId/*'} element={<Calculator />} />
                <Route path={'/calculator/:orderId/:id/*'} element={<Calculator />} />
                <Route path={'/profile/'} element={<Profile />} />

                <Route path={'/product/*'} element={<Fabric/>} />
            </Routes>
            {(!pathname.startsWith('/product/') && !isNotFound) && <MainMenu/>}
        </>
    )
}

export default AuthorizedPage;