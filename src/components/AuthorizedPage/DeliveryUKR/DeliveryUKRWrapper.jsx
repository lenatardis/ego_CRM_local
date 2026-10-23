import React, {useEffect, useState} from "react";
import DeliveryUKR from "./DeliveryUKR";
import { useParams } from "react-router-dom";


const DeliveryUKRWrapper = () => {
    const {id} = useParams();
    const [deliveryOrder, setDeliveryOrder] = useState(null);

    useEffect(() => {
        if (id) {
            // getAccessToken().then((token) => {
                // getDeliverNP(token, lastOrderId).then((result) => {
                //     if (result && result.length > 0) {
                //         setDeliveryOrder(result[0]);
                //     }
                // })
            // });
        }
    }, [id])

    return (
        <>
            {deliveryOrder && (
                <DeliveryUKR deliveryOrder={deliveryOrder} lastOrderId={id} />
            )}
        </>
    )
}

export default DeliveryUKRWrapper;