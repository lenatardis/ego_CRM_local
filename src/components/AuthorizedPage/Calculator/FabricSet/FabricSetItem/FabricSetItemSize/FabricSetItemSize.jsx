import React from "react";
import styles from '../../FabricSet.module.scss';

const FabricSetItemSize = ({size, isActive, setContainerPosition, onSelectSize}) => {
    const handleClick = () => {
        setContainerPosition(2);
        if (!isActive) {
            onSelectSize();
        }
    }

    return (
        <div className={styles.size}>
            <div className={`${styles.size__item} ${isActive ? styles.active : ''}`} onClick={handleClick}>
                <p>{size}</p>
            </div>
        </div>
    )
}

export default FabricSetItemSize;