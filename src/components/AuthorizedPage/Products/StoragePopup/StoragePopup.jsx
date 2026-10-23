import React, { useEffect, useState } from "react";
import styles from './StoragePopup.module.scss';
import StorageItem from "../../../Common/StorageItem/StorageItem";
import { Pagination } from "@mui/material";
import Preloader from "../../../Common/Preloader/Preloader";
import { getAccessToken } from "../../../../utils/authTokens";
import { getStorageProducts } from "../../../../api/productsApi";
import Search from "../../../Common/Search/Search";
import { Filters } from "../../Storage/Filters/Filters";


const StoragePopup = ({ orderId, setOrder, setPopup, sourceID, onAfterProductAdd }) => {
    const [storageList, setStorageList] = useState([]);
    const [categories, setCategories] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const initialFilterParams = {
        page: 1,
        search: null,
        category: [],
        in_stock: true,
        ...(sourceID != null ? { source: sourceID } : {}),
    };

    const [filterParams, setFilterParams] = useState(initialFilterParams);
    console.log(sourceID);


    const fetchStorageProducts = (newFilterParams) => {
        setIsLoading(true);
        const accessToken = getAccessToken();
        getStorageProducts(accessToken, newFilterParams).then((res) => {
            if (res?.items) {
                setStorageList(res.items);
            }
            if (res?.total_pages) {
                setTotalPages(res.total_pages);
            }
            if (categories.length === 0 && res?.categories) {
                setCategories(res.categories);
            }
        }).finally(() => {
            setIsLoading(false);
        });
    };

    useEffect(() => {
        fetchStorageProducts(initialFilterParams);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handlePaginationChange = (event, value) => {
        if (filterParams.page !== value) {
            const newFilterParams = { ...filterParams, page: value };
            setFilterParams(newFilterParams);
            window.scrollTo({ top: 0, behavior: 'auto' });
            fetchStorageProducts(newFilterParams);
        }
    };

    const handleSelectFilter = (id) => {
        const newFilterParams = { ...filterParams, page: 1 };
        if (filterParams.category.includes(id)) {
            newFilterParams.category = newFilterParams.category.filter(item => item !== id);
        } else {
            newFilterParams.category = [...newFilterParams.category, id];
        }
        setFilterParams(newFilterParams);
        fetchStorageProducts(newFilterParams);
    };

    const handleRemoveFilters = () => {
        const newFilterParams = { ...filterParams, page: 1, category: [] };
        setFilterParams(newFilterParams);
        fetchStorageProducts(newFilterParams);
    };


    return (
        <div className={styles.storage}>
            <div className={styles.storage__search}>
                <Search
                    searchValue={filterParams.search}
                    setSearchValue={(value) =>
                        setFilterParams({ ...filterParams, search: value, page: 1 })
                    }
                    onSearch={() => fetchStorageProducts(filterParams)}
                />
            </div>

            {categories.length > 0 && (
                <Filters
                    filters={categories}
                    onChange={handleSelectFilter}
                    removeFilters={handleRemoveFilters}
                    selected={filterParams.category}
                    inPopup
                />
            )}

            <div className={styles.storage__list}>
                <div className={styles.grid}>
                    {storageList && storageList.length > 0 && storageList.map(({ id, name, images, sizes }) => (
                        <StorageItem
                            key={id}
                            orderId={orderId}
                            id={id}
                            name={name}
                            images={images}
                            sizes={sizes}
                            setOrder={setOrder}
                            setPopup={setPopup}
                            inPopup
                            sourceID={sourceID}
                            onAfterProductAdd={onAfterProductAdd}
                        />
                    ))}
                </div>

                {(!storageList.length) && (
                    <p>Товари не знайдені</p>
                )}

                {totalPages > 1 && (
                    <Pagination
                        count={totalPages}
                        page={filterParams.page}
                        siblingCount={1}
                        boundaryCount={1}
                        hidePrevButton
                        hideNextButton
                        onChange={handlePaginationChange}
                    />
                )}
            </div>

            {isLoading && <Preloader />}
        </div>
    );
};

export default StoragePopup;
