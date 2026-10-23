import {Pagination} from "@mui/material";
import FabricsContent from "../../../Fabrics/FabricsContent/FabricsContent";
import Preloader from "../../../../Common/Preloader/Preloader";
import FabricChooser from "../../../Fabrics/FabricChooser/FabricChooserList";
import Search from "../../../../Common/Search/Search";
import arrowIcon from "../../../../../assets/icons/arrowDown.svg";
import styles from "../FabricType.module.scss";
import { useState } from "react";
import GlobalPopup from "../../../../Common/GlobalPopup/GlobalPopup";
import { FabricsSort } from "../../../Fabrics/FabricsSort/FabricsSort";
import eyeIcon from "../../../../../assets/icons/eye.svg";
import eyeClosedIcon from "../../../../../assets/icons/eyeClosed.svg";
import {useIsDesktop} from "../../../../../hooks/useIsDesktop";

const FabricTypePopup = ({
    searchValue,
    setSearchValue,
    page,
    handlePaginationChange,
    totalPages,
    list,
    closeFabricPopup,
    isLoading,
    onFabricTypeChange,
    onSearch,
    fabricTags,
    handleChangeTags,
    selectedTags,
    sortOptions,
    selectedSortParam,
    setSortParam,
    isHideOutOfStock,
    setIsHideOutOfStock,
}) => {
    const [isSortPopup, setIsSortPopup] = useState(false);

    const isDesktop = useIsDesktop();

    return (
        <div>
            <div className={styles.searchWrapper}>
                <Search searchValue={searchValue} setSearchValue={setSearchValue} onSearch={onSearch}/>
                {/* <label className={`${styles.openSortBtn} ${styles.eye}`}>
                    {isHideOutOfStock ? (
                        <img src={eyeClosedIcon} alt="" />
                    ) : (
                        <img src={eyeIcon} alt="" />
                    )}
                    <input
                        type="checkbox"
                        checked={isHideOutOfStock}
                        onChange={() => setIsHideOutOfStock(!isHideOutOfStock)}
                    />
                </label> */}
                <button className={styles.openSortBtn} onClick={() => setIsSortPopup(true)}>
                    <img src={arrowIcon} alt="sort filters" />
                </button>
            </div>
            {fabricTags.length > 0 && (
                <FabricChooser handleChange={handleChangeTags} fabricFilters={fabricTags} selectedFabric={selectedTags} title="Теги тканин:" isNested={true} />
            )}
            {Array.isArray(list) && list.length > 0 && (
                <FabricsContent
                    isCalculator
                    fabricsAll={list}
                    totalPages={totalPages}
                    closeFabricPopup={closeFabricPopup}
                    onFabricTypeChange={onFabricTypeChange}
                />
            )}
            {isSortPopup && (
                <GlobalPopup title={'Сортування тканини:'} onClose={() => setIsSortPopup(false)} isNested {...(isDesktop ? { centeredPopup: true } : {})}>
                    <FabricsSort
                        sortOptions={sortOptions}
                        selectedSortParam={selectedSortParam}
                        setSortParam={setSortParam}
                    />
                </GlobalPopup>
            )}
            {isLoading && <Preloader/>}
            {totalPages > 1 && (
                <Pagination count={totalPages} page={page} siblingCount={1} boundaryCount={1} hidePrevButton
                            hideNextButton onChange={handlePaginationChange}/>
            )}
        </div>
    )
}

export default FabricTypePopup