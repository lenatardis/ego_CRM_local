import React, {useEffect, useState} from "react";
import styles from './Storage.module.scss';
import StorageItem from "../../Common/StorageItem/StorageItem";
import {Pagination} from "@mui/material";
import Preloader from "../../Common/Preloader/Preloader";
import { getStorageProducts } from "../../../api/productsApi";
import { getAccessToken } from "../../../utils/authTokens";
import { Filters } from "./Filters/Filters";
import Search from "../../Common/Search/Search";
import ArrBack from "../../Common/ArrBack/ArrBack";
import { useIsDesktop } from "../../../hooks/useIsDesktop";
import eyeIcon from "../../../assets/icons/eye.svg";
import eyeClosedIcon from "../../../assets/icons/eyeClosed.svg";

const Storage = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [list, setList] = useState([]);
    const [categories, setCategories] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [filterParams, setFilterParams] = useState({
        page: 1,
        search: null,
        category: [],
        in_stock: null
    })

    const fetchStorageProducts = (newFilterParams) => {
        setIsLoading(true);
        const accessToken = getAccessToken();
        getStorageProducts(accessToken, newFilterParams).then((res) => {
            if (res?.items) {
                setList(res.items);
            }
            if (res?.total_pages) {
                setTotalPages(res.total_pages);
            }
            if (categories.length === 0 && res?.categories) {
                setCategories(res.categories);
            }
        }).finally(() => {
            setIsLoading(false);
        })
    }

    useEffect(() => {
        fetchStorageProducts(filterParams);
    }, [])

    const handlePaginationChange = (event, value) => {
        if (filterParams.page !== value) {
            const newFilterParams = { ...filterParams, page: value };
            setFilterParams(newFilterParams);
            window.scrollTo({top: 0, behavior: 'auto'});
            fetchStorageProducts(newFilterParams);
        }
    }

    const handleSelectFilter = (id) => {
        const newFilterParams = { ...filterParams, page: 1 };
        if (filterParams.category.includes(id)) {
            newFilterParams.category = newFilterParams.category.filter(item => item !== id);
        } else {
            newFilterParams.category = [...newFilterParams.category, id];
        }
        setFilterParams(newFilterParams);
        fetchStorageProducts(newFilterParams);
    }

    const handleRemoveFilters = () => {
        const newFilterParams = { ...filterParams, page: 1, category: []};
        setFilterParams(newFilterParams);
        fetchStorageProducts(newFilterParams);
    }

    const handleToggleInStock = () => {
        const newFilterParams = {
            ...filterParams,
            page: 1,
            in_stock: filterParams.in_stock ? null : true,
        };

        setFilterParams(newFilterParams);
        fetchStorageProducts(newFilterParams);
    }

     const isDesktop = useIsDesktop();

    return (
        <div className={styles.storage}>
            <div className={styles.storageWrap}>
                {isDesktop && <ArrBack/>}
                <div className={styles.storage__search}>
                    <Search
                        searchValue={filterParams.search}
                        setSearchValue={(value) => setFilterParams({ ...filterParams, search: value, page: 1 })}
                        onSearch={() => fetchStorageProducts(filterParams)}
                    />
                </div>
                {categories.length > 0 && (
                    <Filters
                        filters={categories}
                        onChange={handleSelectFilter}
                        removeFilters={handleRemoveFilters}
                        selected={filterParams.category}
                        isInStockOnly={!!filterParams.in_stock}
                        onToggleInStock={handleToggleInStock}
                        eyeIcon={eyeIcon}
                        eyeClosedIcon={eyeClosedIcon}
                    />
                )}
                <div className={styles.storageList}>
                    {list && list.length > 0 &&
                        list.map(({ id, name, images, sizes }) => <StorageItem key={id} id={id} name={name} images={images} sizes={sizes} copy />)
                    }
                </div>
                {totalPages > 1 && (
                    <Pagination className={styles.pagination} count={totalPages} page={filterParams.page} siblingCount={1}
                                boundaryCount={1} hidePrevButton hideNextButton onChange={handlePaginationChange}/>
                )}
                {isLoading && (
                    <Preloader />
                )}
            </div>
        </div>
    )
}

export default Storage;