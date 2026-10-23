import { useState } from "react";
import styles from "./filters.module.scss";

export const Filter = ({ item, onChange, isActive }) => {
    
    return (
        <li className={styles.filter}>
            <label className={styles.filter__label}>
                <input type="checkbox" onChange={() => onChange(item.id)} checked={isActive} />
                <span>{item.name}</span>
            </label>
        </li>
    )
}
