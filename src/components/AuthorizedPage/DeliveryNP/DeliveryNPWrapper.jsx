import React, {useEffect, useState} from "react";
import DeliveryNP from "./DeliveryNP";
import { useParams } from "react-router-dom";
import Preloader from "../../Common/Preloader/Preloader";
import { useAppDispatch } from "../../../hooks/redux";
import { setIsNotFound } from "../../../store/main-slice";
import NotFound from "../../Common/NotFound/NotFound";
import { getAccessToken } from "../../../utils/authTokens";
import { getDeliverNP, setDeliverNP } from "../../../api/novaPoshtaApi";


const DeliveryNPWrapper = () => {
    const {id} = useParams();
    const [deliveryOrder, setDeliveryOrder] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const dispatch = useAppDispatch();


    useEffect(() => {
        if (id) {
            let accessToken = getAccessToken();
            getDeliverNP(accessToken, id).then((result) => {
                if (result && result.length > 0) {
                    setDeliveryOrder(result[0]);
                    setIsLoading(false);
                } else if (result?.detail) {
                    accessToken = getAccessToken();
                    setDeliverNP(accessToken, id, {'paid_by_the_sender': false, 'payment_method': 'NON_CASH'}).then((res) => {
                        if (res?.id) {
                            setDeliveryOrder(res);
                        } else {
                            dispatch(setIsNotFound(true));
                        }
                    }).finally(() => setIsLoading(false))
                }
            }).catch(err => {
                console.log(err);
                setIsLoading(false);
            })
        }
    }, [id])

    return (
        <>
            {!isLoading && deliveryOrder && (
                <DeliveryNP deliveryOrder={deliveryOrder} lastOrderId={id} />
            )}
            {isLoading && (
                <Preloader />
            )}
            {!deliveryOrder && !isLoading && (
                <NotFound message={`Замовлення №${id} не знайдено`} />
            )}
        </>
    )
}

export default DeliveryNPWrapper;