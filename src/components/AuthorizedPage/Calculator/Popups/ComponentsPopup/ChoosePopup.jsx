import FiltersChooseItem from "./FiltersChooseItem";
import styles from "./ComponentsPopup.module.scss";

export default function ChoosePopup({ allFilters, selectedFilters, handleSelectFilter }) {
    return (
        <div className={styles.chooserPopup}>
            {allFilters && allFilters.length > 0 && (
                allFilters.map((item, index) => (
                    <FiltersChooseItem key={index} item={item} selectedFilters={selectedFilters} handleSelectFilter={handleSelectFilter} />
                ))
            )}
        </div>
    )
}
