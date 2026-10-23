import React, {useEffect, useState} from "react";
import styles from "./ChoosePopup.module.scss";


const FabricChooseItem = ({item, handleChange, selectedFabric}) => {
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        if (selectedFabric && selectedFabric.length) {
            const isHasItem = selectedFabric.find((element) => element === item);

            if (isHasItem) {
                setIsActive(true);
            } else {
                setIsActive(false)
            }
        } else {
            setIsActive(false)
        }
    }, [item, selectedFabric])

    return (
        <div className={styles.customCheckbox}>
            <input type="checkbox" checked={isActive} onChange={() => handleChange(item)} />
            <span/>
            <p>{item.type}</p>
        </div>
    )
}

export default FabricChooseItem;