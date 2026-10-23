import FiltersChooserSmall from "./FiltersChooserSmall";
import styles from "./ComponentsPopup.module.scss";
import arrow from '../../../../../assets/icons/arrowDown.svg';
import GlobalPopup from "../../../../Common/GlobalPopup/GlobalPopup";
import { useState } from "react";
import ChoosePopup from "./ChoosePopup";

export default function ComponentsFilters({ allFilters, selectedFilters, handleSelectFilter }) {
    const [isFiltersPopupOpen, setIsFiltersPopupOpen] = useState(false);

    const smallList = allFilters && allFilters.length > 4
        ? [allFilters[0], allFilters[1], allFilters[2], allFilters[3]]
        : null;

    return (
        <>
            {smallList ? (
                <ul className={styles.fabricChooser}>
                    {
                        smallList.map((item, index) => (
                            <FiltersChooserSmall
                                selectedFilters={selectedFilters}
                                handleSelectFilter={handleSelectFilter}
                                key={index}
                                item={item}
                            />
                        ))
                    }
                    <button className={styles.fabricChooser__else}
                            onClick={() => setIsFiltersPopupOpen(true)}>
                        <img src={arrow} alt=""/>
                    </button>
                </ul>
                ) : (
                <ul className={styles.fabricChooser}>
                    {allFilters.map((item, index) => (
                        <FiltersChooserSmall
                            selectedFilters={selectedFilters}
                            handleSelectFilter={handleSelectFilter}
                            key={index}
                            item={item}
                        />
                    ))}
                </ul>
                )
            }
            {isFiltersPopupOpen && (
                <GlobalPopup title={'Типи комплектуючих:'} onClose={() => setIsFiltersPopupOpen(false)}>
                    <ChoosePopup allFilters={allFilters} selectedFilters={selectedFilters} handleSelectFilter={handleSelectFilter}/>
                </GlobalPopup>
            )}
        </>
    )
}
