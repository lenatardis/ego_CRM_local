import {Route, Routes, useLocation} from "react-router-dom";
import {useEffect, useMemo, useState} from "react";
import Auth from "./Auth/Auth";
import UserMenu from "../Navigations/UserMenu";
import React from "react";
import Contacts from "./Contacts/Contacts";
import Callback from "./Callback/Callback";
import Status from "./Status/Status";
import DetailsPayment from "./DetailsPayment/DetailsPayment";
import FinishOrder from "./FinishOrder/FinishOrder";
import Fabric from "../UserPage/Fabric";
import queryString from "query-string";

 const ORDER_HASH_STORAGE_KEY = 'client_order_hash';

const ClientPage = () => {
   const { pathname, search } = useLocation();

    const parsedQuery = useMemo(() => queryString.parse(search), [search]);
    const orderHashFromQuery = parsedQuery?.order || null;
    const isStatusPage = pathname.startsWith('/orders/');
    const [savedOrderHash, setSavedOrderHash] = useState(() => {
        if (isStatusPage && !orderHashFromQuery) {
            return null;
        }

        return sessionStorage.getItem(ORDER_HASH_STORAGE_KEY) || null;
    });

    useEffect(() => {
        if (!isStatusPage) {
            return;
        }

        if (orderHashFromQuery) {
            sessionStorage.setItem(ORDER_HASH_STORAGE_KEY, orderHashFromQuery);
            setSavedOrderHash(orderHashFromQuery);
        } else {
            sessionStorage.removeItem(ORDER_HASH_STORAGE_KEY);
            setSavedOrderHash(null);
        }
    }, [isStatusPage, orderHashFromQuery]);

    const orderHash = orderHashFromQuery || null;
   
    return (
        <>
            <Routes>
                <Route path={'/*'} element={<Auth/>}/>
                <Route path={'/orders/*'} element={<Status orderHash={orderHash} />} />
                <Route path={'/contacts/'} element={<Contacts/>} />
                <Route path={'/details_payment'} element={<DetailsPayment />} />
                <Route path={'/callback/'} element={<Callback/>} />

                <Route path={'/product/*'} element={<Fabric/>} />
                <Route path={'/monobank/finish-order/*'} element={<FinishOrder paymentType='monobank' />} />
                <Route path={'/wayforpay/finish-order/*'} element={<FinishOrder paymentType='wayforpay' />} />
            </Routes>
            {!pathname.startsWith('/product/') && <UserMenu savedOrderHash={savedOrderHash}/>}
        </>
    )
}

export default ClientPage;