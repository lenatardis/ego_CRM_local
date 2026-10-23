import React from "react";
import styles from './FabricTypeFabrics.module.scss';
import imgPlaceholder from "../../../../../assets/icons/typePlaceholder.svg";

const FabricTypeItem = ({item, isActive = false, onClick}) => {
    return (
        item.img ? (
            <div className={`${styles.fabric__itemWrap} ${isActive ? styles.fabric__active : ''}`} onClick={onClick}>
                <img src={item.img} alt="" className={styles.fabric__itemImg}/>
                <p>{item.name}</p>
            </div>
        ) : (
            <div className={`${styles.fabric__itemWrap} ${isActive ? styles.fabric__active : ''}`} onClick={onClick}>
                <div className={styles.fabric__placeholder}>
                    <img src={imgPlaceholder} alt=""/>
                </div>
                <p>{item.name}</p>
            </div>
        )
    )
}

export default FabricTypeItem