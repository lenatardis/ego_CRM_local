import {useParams} from "react-router";
import React, {useEffect, useState} from "react";
import OrderCreate from "./OrderCreate";
import Preloader from "../../Common/Preloader/Preloader";
import NotFound from "../../Common/NotFound/NotFound";
import { useAppDispatch } from "../../../hooks/redux";
import { setGeneralOrderId, setIsNotFound } from "../../../store/main-slice";
import { getAccessToken } from "../../../utils/authTokens";
import {getOrderInfo, getSources} from "../../../api/ordersApi";
import { updatePayment } from "../../../api/paymentApi";
import { updateCustomer } from "../../../api/customersApi";


const OrderWrapper = () => {
    const {id} = useParams();
    const [order, setOrder] = useState(null);
    const [sourcesList, setSourcesList] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const dispatch = useAppDispatch();

    const updateOrder = (value) => {
        let accessToken = getAccessToken();
        getOrderInfo(accessToken, value).then((response) => {
            if (response?.id) {
                if (response.general_order) {
                    dispatch(setGeneralOrderId(response.general_order.id));
                } else {
                    dispatch(setGeneralOrderId(null));
                }
                accessToken = getAccessToken();
                setOrder(response);
                if (!response?.payment) {
                    updatePayment(accessToken, response.id, {'post_paid_amount': null}).then((res) => console.log(res));
                }
                if (!response?.customer) {
                    updateCustomer(accessToken, response.id, {'first_name': null}).then((res) => console.log(res));
                }
                getSources(accessToken).then((sources) => {
                    setSourcesList(sources);
                });
            } else {
                dispatch(setIsNotFound(true));
            }
        }).finally(() => {
            setIsLoading(false);
        })
    }
    useEffect(() => {
        if (id) {
            updateOrder(id);
        }
    }, [id])


    return (
        <>
            {order && (
                <OrderCreate order={order} sourcesList={sourcesList}/>
            )}
            {isLoading && (
                <Preloader />
            )}
            {!isLoading && !order && (
                <NotFound message={`Замовлення №${id} не знайдено`} />
            )}
        </>
    )
}

export default OrderWrapper;