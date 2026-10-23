import { useEffect, useState } from "react";
import styles from "./ComponentsPopup.module.scss"

export default function FiltersChooserSmall({ item, selectedFilters, handleSelectFilter }) {
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        if (selectedFilters && selectedFilters.length) {
            const isHasItem = selectedFilters.find((element) => element === item);

            if (isHasItem) {
                setIsActive(true);
            } else {
                setIsActive(false)
            }
        } else {
            setIsActive(false)
        }
    }, [item, selectedFilters])


    return (
        <li className={styles.choose}>
            <label>
                <input type="checkbox" checked={isActive} onChange={() => handleSelectFilter(item)} />
                <span>{item.name}</span>
            </label>
        </li>
    )
}
