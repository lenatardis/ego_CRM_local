import React, {useEffect} from "react";
import {useAppDispatch} from "./hooks/redux";
import ClientPage from "./components/ClientPage/ClientPage";
import AuthorizedPage from "./components/AuthorizedPage/AuthorizedPage";
import { sendOrderHash } from "./api/ordersApi";
import queryString from "query-string";
import {useLocation, useNavigate} from "react-router";
import Preloader from "./components/Common/Preloader/Preloader";
import { useUserAuth } from "./hooks/useUserAuth";
import { login } from "./store/account-slice";
import './App.scss';

function App() {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const params = useLocation();
    const urlString = params.search;
    const hash = queryString.parse(urlString);
    const { userData, isUserDataFetching } = useUserAuth();

    useEffect(() => {
        if (userData) {
            dispatch(login(userData));
            if (hash?.order) {
                sendOrderHash(hash.order).then(response => {
                    if (response?.order?.id) {
                        navigate(`/order/${response.order.id}`);
                    }
                })
            }
        }
    }, [userData])

    if (isUserDataFetching) {
        return <Preloader/>;
    }

    return (
        <div className='wrapper'>
            {userData?.id
                ? <AuthorizedPage/>
                : <ClientPage/>
            }
        </div>
    );
}

export default App;