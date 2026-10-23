import React from "react";
import ProductItem from "../../../Common/ProductItem/ProductItem";
import { getAccessToken } from "../../../../utils/authTokens";
import { removeProduct } from "../../../../api/productsApi";
import { updatePayment } from "../../../../api/paymentApi";

const CartProducts = ({items, setItems, setOrderPayment, isDisabled, sourceName}) => {
    const handleDeleteItem = (id) => {
        let accessToken = getAccessToken();
        removeProduct(accessToken, id).then(result => {
            if (result === 204) {
                const newItems = items.filter(item => item.id !== id);
                setItems(newItems);
                if (newItems.length === 0) {
                    accessToken = getAccessToken();
                    updatePayment(accessToken, items[0].order, { final_amount: null, amount: null, status: 'NONE' }).then((res) => {
                        if (res.id) {
                            setOrderPayment(res);
                        }
                    })
                }
            }
        })
    }

    return (
        <div>
            {items && items.length > 0 && items.map((el, index) => (
                <ProductItem item={el} key={index} onDelete={handleDeleteItem} isDisabled={isDisabled} sourceName={sourceName}/>
            ))}
        </div>
    )
}

export default CartProducts;