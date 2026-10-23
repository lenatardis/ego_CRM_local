import React, {useState} from "react";
import styles from './FabricTypeFabrics.module.scss';
import FabricTypeItem from "./FabricTypeItem";
import {useAppDispatch} from "../../../../../hooks/redux";
import {setIsActivePopup} from "../../../../../store/main-slice";
import GlobalPopup from "../../../../Common/GlobalPopup/GlobalPopup";
import FabricTypePopup from "../FabricTypePopup/FabricTypePopup";
import { getAccessToken } from "../../../../../utils/authTokens";
import { getFabrics } from "../../../../../api/productsApi";

const initialFilterParams = {
    page: 1,
    search: null,
    type: [],
    tags: [],
    order_by: null,
    is_hide_out_of_stock: null,
    is_available: true
};

const FabricTypeFabrics = ({
    fabricTypes,
    selectedFabric,
    setSelectedFabric,
    isEdit,
    fabric,
    onFabricTypeChange,
}) => {
    const [fabrics, setFabrics] = useState([]);
    const [totalPages, setTotalPages] = useState(0);
    const [showFabricPopup, setShowFabricPopup] = useState(false);
    const [fabricTags, setFabricTags] = useState([]);
    const [selectedTags, setSelectedTags] = useState([]);
    const [sortOptions, setSortOptions] = useState([]);
    const dispatch = useAppDispatch();
    const [isLoading, setIsLoading] = useState(false);
    const [filterParams, setFilterParams] = useState(initialFilterParams);

    const fetchFabrics = (newFilterParams) => {
        setIsLoading(true);
        const accessToken = getAccessToken();
        getFabrics(accessToken, newFilterParams).then((response) => {
            if (response?.fabrics) {
                setFabrics(response.fabrics);
            }
            if (response?.tags && fabricTags.length === 0) {
                setFabricTags(response.tags.map(tag => ({ id: tag.id, type: tag.name })));
            }
            if (response?.order_by) {
                setSortOptions(response.order_by);
            }
            setTotalPages(response?.total_pages);
        }).finally(() => setIsLoading(false))
    }

    const handlePaginationChange = (event, value) => {
        if (filterParams.page !== value) {
            const newFilterParams = { ...filterParams, page: value };
            setFilterParams(newFilterParams);
            fetchFabrics(newFilterParams);
        }
    };

    const openFabricPopup = (name) => {
        setShowFabricPopup(true);
        dispatch(setIsActivePopup(true));
    }

    const closeFabricPopup = () => {
        dispatch(setIsActivePopup(false));
        setShowFabricPopup(false);
        setFabrics([]);
        setSelectedTags([]);
        setFilterParams(initialFilterParams);
        setTotalPages(0);
    }

    const onSendFilters = (newFilterParams) => {
        const params = { ...newFilterParams, page: 1 };
        setFilterParams(params);
        fetchFabrics(params);
    }

    const handleSelectFabricItem = (item) => {
        openFabricPopup(item.name);
        const newFilterParams = { ...filterParams, type: [item.id] };
        setSelectedFabric(item.id);
        onSendFilters(newFilterParams);
    }

    const handleSelectSortParam = (value) => {
        const newParams = { ...filterParams, order_by: value }
        setFilterParams(newParams);
        onSendFilters(newParams);
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

    return (
        <div className={styles.fabric}>
            <div className={styles.fabric__row}>
                {!isEdit? fabricTypes.map((item) => (
                    <FabricTypeItem
                        key={item.name}
                        item={item}
                        isActive={item.id === selectedFabric}
                        onClick={() => handleSelectFabricItem(item)}
                    />
                )) : fabricTypes.filter(el => el.id === fabric?.type_id)
                    .map((item) => <FabricTypeItem key={item.name} item={item} isActive onClick={() => handleSelectFabricItem(item)}/>)}
            </div>
            {showFabricPopup && filterParams.type.length > 0 && (
                <GlobalPopup topPopup title="Вибір тканини" onClose={() => closeFabricPopup()}>
                    <FabricTypePopup
                        searchValue={filterParams.search}
                        setSearchValue={(value) => setFilterParams(prevParams => ({ ...prevParams, search: value }))}
                        page={filterParams.page}
                        handlePaginationChange={handlePaginationChange}
                        totalPages={totalPages}
                        list={fabrics}
                        isLoading={isLoading}
                        onFabricTypeChange={onFabricTypeChange}
                        closeFabricPopup={closeFabricPopup}
                        onSearch={() => onSendFilters(filterParams)}
                        fabricTags={fabricTags}
                        handleChangeTags={handleChangeTags}
                        selectedTags={selectedTags}
                        sortOptions={sortOptions}
                        selectedSortParam={filterParams.order_by}
                        setSortParam={handleSelectSortParam}
                        isHideOutOfStock={!!filterParams.is_hide_out_of_stock}
                        setIsHideOutOfStock={value => onSendFilters({ ...filterParams, is_hide_out_of_stock: value })}
                    />
                </GlobalPopup>
            )}
        </div>
    )
}

export default FabricTypeFabrics