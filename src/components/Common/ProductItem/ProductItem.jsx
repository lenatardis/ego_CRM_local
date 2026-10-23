import React, {useState} from "react";
import styles from './ProductItem.module.scss';
import IconArr from "../../../assets/icons/arrowDown.svg";
import OpenItemMobile from "./OpenItem/OpenItemMobile";
import OpenItemDesktop from "./OpenItem/OpenItemDesktop";
import ClosedItem from "./ClosedItem/ClosedItem";
import {useIsDesktop} from "../../../hooks/useIsDesktop";

const ProductItem = ({isOpen, item, onDelete, isClient, isDisabled, sourceName}) => {
    const [open, setOpen] = useState(isOpen);

    const product = {
        id: item.id,
        name: item.kit ? item.kit.name : item.warehouse_item.name,
        images: item.kit ? [item.kit.fabric_image] : [item.warehouse_item.image],
        quantity: item.kit ? null : item.warehouse_item.quantity,
        size: item.kit ? null : item.warehouse_item.size,
        color: item.kit ? null : item.warehouse_item.color,
        price: item.kit ? item.kit.price : item.warehouse_item.price,
        fabric_type: item.kit ? item.kit.fabric : null,
        kit_type: item.kit ? item.kit.type : null,
        components: item.kit ? item.kit.component : "",
        options: item.kit ? item.kit.option : [],
        warehouseComment: item?.warehouse_item?.comment,
        kitComment: item?.kit?.comment,
        manufacturing: item?.manufacturing
    }

    const isDesktop = useIsDesktop();

    const toggleOpen = () => {
        setOpen(prevOpen => !prevOpen);
    }

    const handleDeleteItem = (id) => {
        setOpen(false);
        onDelete(id);
    }

    return (
        <>
            {!isDesktop && <div className={styles.productItem}>
                {open
                    ? <OpenItemMobile product={product} onDelete={handleDeleteItem} isClient={isClient} isDisabled={isDisabled}/>
                    : <ClosedItem {...product} sourceName={sourceName} isClient={isClient}  originalSourceName={item?.warehouse_item?.source?.name}/>}
                <div className={styles.panel} onClick={toggleOpen}>
                    <button>
                        <img src={IconArr} alt="" className={open? styles.arrUp : ''}/>
                    </button>
                </div>
            </div>}
            {
                isDesktop && <div className={styles.productItem}>
                    <OpenItemDesktop product={product} onDelete={handleDeleteItem} isClient={isClient} isDisabled={isDisabled} sourceName={sourceName} originalSourceName={item?.warehouse_item?.source?.name}/>
                </div>
            }

        </>
    )
}

export default ProductItem;