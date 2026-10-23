import { Filter } from "./Filter";
import styles from "./filters.module.scss";
import removeFiltersIcon from "../../../../assets/icons/filter-remove-icon.svg";

export const Filters = ({
    filters,
    onChange,
    removeFilters,
    selected,
    isInStockOnly,
    onToggleInStock,
    eyeIcon,
    eyeClosedIcon,
    inPopup
}) => {
    return (
        <ul className={styles.filters}>
            {filters.map((item, index) => (
                <Filter key={index} item={item} onChange={onChange} isActive={selected.includes(item.id)} />
            ))}

            <button className={styles.filters__removeFilters} onClick={removeFilters}>
                <img src={removeFiltersIcon} alt="" />
            </button>

            {!inPopup  && (<label
                className={styles.filters__eye}
                title={
                    isInStockOnly
                        ? "Відображаються тільки товари в наявності"
                        : "Відображаються всі товари"
                }
            >
                <img
                    src={isInStockOnly ? eyeClosedIcon : eyeIcon}
                    alt=""
                />
                <input
                    type="checkbox"
                    checked={isInStockOnly}
                    onChange={onToggleInStock}
                />
            </label>)}
        </ul>
    )
}