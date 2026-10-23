import React, {useEffect, useState} from "react";
import styles from './Fabrics.module.scss';
import {useAppDispatch} from "../../../hooks/redux";
import FabricChooser from "./FabricChooser/FabricChooserList";
import FabricsContent from "./FabricsContent/FabricsContent";
import GlobalPopup from "../../Common/GlobalPopup/GlobalPopup";
import {setIsActivePopup} from "../../../store/main-slice";
import { Pagination } from '@mui/material';
import Preloader from "../../Common/Preloader/Preloader";
import { getAccessToken } from "../../../utils/authTokens";
import { getFabrics } from "../../../api/productsApi";
import arrowIcon from "../../../assets/icons/arrowDown.svg";
import { FabricsSort } from "./FabricsSort/FabricsSort";
import Search from "../../Common/Search/Search";
import eyeIcon from "../../../assets/icons/eye.svg";
import eyeClosedIcon from "../../../assets/icons/eyeClosed.svg";
import {useIsDesktop} from "../../../hooks/useIsDesktop";
import ArrBack from "../../Common/ArrBack/ArrBack";

const Fabrics = () => {
    const dispatch = useAppDispatch();
    const [fabric, setFabric] = useState(null);
    const [totalPages, setTotalPages] = useState(0);
    const [selectedFabric, setSelectedFabric] = useState([]);
    const [selectedTags, setSelectedTags] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSortPopup, setIsSortPopup] = useState(false);
    const [filterParams, setFilterParams] = useState({
        page: 1,
        search: null,
        type: [],
        tags: [],
        order_by: null,
        is_hide_out_of_stock: null
    });

    const isDesktop = useIsDesktop();

    useEffect(() => {
        setIsLoading(true);
        const accessToken = getAccessToken();
        getFabrics(accessToken, filterParams).then((response) => {
            if (response?.fabrics) {
                const tags = response?.tags?.map(tag => ({ id: tag.id, type: tag.name }));
                setFabric({ ...response, tags: tags });
            }
            setTotalPages(response?.total_pages);
        }).catch(err => {
            console.error("Error fetching fabrics: ", err);
        }).finally(() => {
            setIsLoading(false);
        });
    }, []);

    const fetchFabrics = (newFilterParams) => {
        setIsLoading(true);
        const accessToken = getAccessToken();
        getFabrics(accessToken, newFilterParams).then((response) => {
            if (response?.fabrics) {
                setFabric(prevFabric => ({ ...prevFabric, fabrics: response.fabrics }));
            }
            setTotalPages(response?.total_pages);
        }).finally(() => setIsLoading(false))
    }

    const handlePaginationChange = (event, value) => {
        if (filterParams.page !== value) {
            const newFilterParams = { ...filterParams, page: value };
            setFilterParams(newFilterParams);
            window.scrollTo({top: 0, behavior: 'auto'});
            fetchFabrics(newFilterParams);
        }
    };

    const onSendFilters = (newFilterParams) => {
        const filterParams = { ...newFilterParams, page: 1 };
        setFilterParams(filterParams);
        fetchFabrics(filterParams);
    }

    const handleChangeTypes = (value) => {
        const isItemValue = selectedFabric.find((item) => item.id === value.id);
        if (isItemValue) {
            const newArray = [];
            const filterIds = [];
            for (const filter of selectedFabric) {
                if (filter.id !== value.id) {
                    newArray.push(filter);
                    filterIds.push(filter.id);
                }
            }
            const newFilters = { ...filterParams, type: filterIds };
            setSelectedFabric(newArray);
            onSendFilters(newFilters);

        } else {
            const newFilters = { ...filterParams, type: [ ...filterParams.type, value.id ]};
            setSelectedFabric([ ...selectedFabric, value ]);
            onSendFilters(newFilters);
        }
    }

    const handleRemoveTypeFilters = () => {
        const newFilters = { ...filterParams, type: [] };
        setSelectedFabric([]);
        onSendFilters(newFilters);
    }

    const handleChangeTags = (value) => {
        const isItemValue = selectedTags.find((item) => item.id === value.id);
        if (isItemValue) {
            const newTags = [];
            const tagIds = [];
            for (const tag of selectedTags) {
                if (tag.id !== value.id) {
                    newTags.push(tag);
                    tagIds.push(tag.id);
                }
            }
            const newFilters = { ...filterParams, tags: tagIds };
            setSelectedTags(newTags);
            onSendFilters(newFilters);
        } else {
            const newFilters = { ...filterParams, tags: [ ...filterParams.tags, value.id ]};
            setSelectedTags([ ...selectedTags, value ])
            onSendFilters(newFilters);
        }
    }

    const handleRemoveTypeTags = () => {
        const newFilters = { ...filterParams, tags: [] };
        setSelectedTags([]);
        onSendFilters(newFilters);
    }

    const handleChangeSort = (value) => {
        const newFilters = { ...filterParams, order_by: value };
        setFilterParams(newFilters);
        onSendFilters(newFilters);
    }

    const handleOpenSortPopup = () => {
        setIsSortPopup(true);
        dispatch(setIsActivePopup(true));
    }

    return (
        <div className={styles.fabrics}>
            <div className={styles.fabricsWrap}>
                {isDesktop && <ArrBack/>}
                <div className={styles.searchWrapper}>
                    <Search
                        searchValue={filterParams.search}
                        setSearchValue={(value) => setFilterParams(prevParams => ({ ...prevParams, search: value }))}
                        onSearch={() => onSendFilters(filterParams)}
                    />
                    <label className={`${styles.openSortBtn} ${styles.eye}`} title={
                        filterParams.is_hide_out_of_stock
                            ? "Відображаються тільки наявні тканини"
                            : "Відображаються всі тканини"
                    }>
                        {filterParams.is_hide_out_of_stock ? (
                            <img src={eyeClosedIcon} alt="" />
                        ) : (
                            <img src={eyeIcon} alt="" />
                        )}
                        <input
                            type="checkbox"
                            checked={!!filterParams.is_hide_out_of_stock}
                            onChange={() => onSendFilters({ ...filterParams, is_hide_out_of_stock: !filterParams.is_hide_out_of_stock })}
                        />
                    </label>
                    <button className={styles.openSortBtn} onClick={handleOpenSortPopup}>
                        <img src={arrowIcon} alt="sort filters" />
                    </button>
                </div>
                {fabric?.fabric_types?.length > 0 && (
                    <div style={{ marginBottom: 10 }}>
                        <FabricChooser handleChange={handleChangeTypes} fabricFilters={fabric.fabric_types} selectedFabric={selectedFabric} removeFilters={handleRemoveTypeFilters} type />
                    </div>
                )}
                {fabric?.tags?.length > 0 && (
                    <FabricChooser handleChange={handleChangeTags} fabricFilters={fabric.tags} selectedFabric={selectedTags} title="Теги тканин:" removeFilters={handleRemoveTypeTags}/>
                )}
                {fabric?.fabrics?.length > 0 && (
                    <FabricsContent fabricsAll={fabric.fabrics} totalPages={totalPages}/>
                )}
                {totalPages > 1 && (
                    <Pagination count={totalPages} page={filterParams.page} siblingCount={1} boundaryCount={1} hidePrevButton hideNextButton onChange={handlePaginationChange} />
                )}
                {isLoading && (
                    <Preloader />
                )}
                {isSortPopup && (
                    <GlobalPopup title={'Сортування тканини:'} {...(isDesktop ? { centeredPopup: true } : {})} onClose={() => setIsSortPopup(false)}>
                        <FabricsSort
                            sortOptions={fabric?.order_by || []}
                            selectedSortParam={filterParams.order_by}
                            setSortParam={handleChangeSort}
                        />
                    </GlobalPopup>
                )}
            </div>
        </div>
    )
}

export default Fabrics;