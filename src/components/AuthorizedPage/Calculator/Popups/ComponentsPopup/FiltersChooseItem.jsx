import { useEffect, useState } from "react";
import styles from "./ComponentsPopup.module.scss";

export default function FiltersChooseItem({ item, selectedFilters, handleSelectFilter }) {
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
        <div className={styles.customCheckbox}>
            <input type="checkbox" checked={isActive} onChange={() => handleSelectFilter(item)} />
            <span/>
            <p>{item.name}</p>
        </div>
    )
}
