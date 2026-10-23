import styles from "./fabricSort.module.scss";

export const SortItem = ({ item, isSelected, onChange }) => {
    const toggleOption = () => {
        if (isSelected) {
            onChange(null);
        } else {
            onChange(item.name);
        }
    }

    return (
        <li>
            <label className={styles.optionLabel}>
                <input type="checkbox" checked={isSelected} onChange={toggleOption} />
                <span className={styles.checkbox}></span>
                <span className={styles.name}>{item.value}</span>
            </label>
        </li>
    )
}
