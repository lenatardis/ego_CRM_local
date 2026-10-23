import React, {useEffect, useState} from "react";
import styles from './FabricChooserList.module.scss';


const FabricChoose = ({item, handleChange, selectedFabric}) => {
    const [isActive, setIsActive] = useState(false)

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
        <li className={styles.choose}>
            <label>
                <input type="checkbox" checked={isActive} onChange={() => handleChange(item)} />
                <span>{item.type}</span>
            </label>
        </li>
    )
}

export default FabricChoose;