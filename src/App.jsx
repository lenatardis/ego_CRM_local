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
import { useTranslation } from "react-i18next";

function App() {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const params = useLocation();
    const urlString = params.search;
    const hash = queryString.parse(urlString);
    const { userData, isUserDataFetching } = useUserAuth();
    // Demo build (2026-11-18): a language switch re-mounts the pages, so everything – data from the mock
    // backend included (catalog names, messages) – is shown again in the new language
    const { i18n } = useTranslation();

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
        <div className='wrapper' key={i18n.language}>
            {userData?.id
                ? <AuthorizedPage/>
                : <ClientPage/>
            }
        </div>
    );
}

export default App;