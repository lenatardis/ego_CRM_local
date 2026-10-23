import React from "react";
import ProductItem from "../../../Common/ProductItem/ProductItem";


const List = ({products}) => {
    return (
        <div>
            <h3>Товари в замовленні</h3>
            <div>
                {products && products.length > 0 && products.map((el, index) => <ProductItem item={el} key={index} isClient/>)}
            </div>
        </div>
    )
}

export default List;