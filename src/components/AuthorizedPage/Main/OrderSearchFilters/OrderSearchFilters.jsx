import React, {useEffect, useRef, useState} from "react";
import styles from './OrderSearchFilters.module.scss';
import searchIcon from "../../../../assets/icons/search.svg";
import {useAppDispatch} from "../../../../hooks/redux";
import {setOrders} from "../../../../store/main-slice";
import { getAccessToken } from "../../../../utils/authTokens";
import { getSearchResult } from "../../../../api/searchApi";

const OrderSearchFilters = ({setOrdersFilter, searchValue, setSearchValue, filterLabels, setFilterLabels, setPage,
                                setTotalPages, page, onResetSearchList}) => {
    const dispatch = useAppDispatch();
    const [isDisabled, setIsDisabled] = useState(false);
    const timeout = useRef(null);

    const sendSearch = (value = null, page) => {
        setIsDisabled(true);
        const accessToken = getAccessToken();
        getSearchResult(accessToken, searchValue, value ? value.is_order : true, value ? value.is_fabric : true, value ? value.is_warehouse_item : true, page).then((resp) => {
            if (resp && Array.isArray(resp?.orders?.items)) {
                setOrdersFilter('all');
                dispatch(setOrders(resp.orders.items));
                setIsDisabled(false);
                setPage(resp.orders.current_page === 0 ? 1 : resp.orders.current_page);
                setTotalPages(resp.orders.total_pages)
                if (resp && resp.filter && resp.filter) {
                    setFilterLabels(resp.filter)
                }
            } else {
                setIsDisabled(false);
            }
        })
    }

    const hasMounted = useRef(false);

    useEffect(() => {
        if (!hasMounted.current) {
            hasMounted.current = true;
            return;
        }
        clearTimeout(timeout.current);

        if (searchValue.length > 0) {
            if (filterLabels !== null) {
                setFilterLabels(null);
            }

            timeout.current = setTimeout(() => {
                sendSearch(null, 1);
            }, 500);

            return () => {
                clearTimeout(timeout.current);
            };
        } else {
            setFilterLabels(null);
            setPage(1);
            setTotalPages(1);

            if (typeof onResetSearchList === 'function') {
                onResetSearchList();
            }
        }
    }, [searchValue]);


    useEffect(() => {
        if (searchValue !== '' && searchValue.length >= 1) {
            sendSearch(filterLabels, page)
        }

    }, [page])


    return (
        <>
            <div className={styles.search}>
                <input type="search" placeholder={'Пошук'} className={'baseInput'} value={searchValue}
                       onChange={(e) => setSearchValue(e.target.value)}/>
                <img src={searchIcon} alt=""/>
            </div>
            {filterLabels && (filterLabels.is_order || filterLabels.is_fabric || filterLabels.is_warehouse_item) && (
                <div className={styles.filterButtons}>
                    <button disabled={isDisabled}
                            className={filterLabels.is_order ? styles.btnFilterActive : styles.btnFilter}
                            onClick={() => {
                                sendSearch({
                                    is_fabric: filterLabels.is_fabric,
                                    is_order: !filterLabels.is_order,
                                    is_warehouse_item: filterLabels.is_warehouse_item
                                }, 1)
                            }}>
                        <p>Замовлення</p>
                        <span/>
                    </button>
                    <button disabled={isDisabled}
                            className={filterLabels.is_fabric ? styles.btnFilterActive : styles.btnFilter}
                            onClick={() => {
                                sendSearch({
                                    is_fabric: !filterLabels.is_fabric,
                                    is_order: filterLabels.is_order,
                                    is_warehouse_item: filterLabels.is_warehouse_item
                                }, 1)
                            }}>
                        <p>Тканини</p>
                        <span/>
                    </button>
                    <button disabled={isDisabled}
                            className={filterLabels.is_warehouse_item ? styles.btnFilterActive : styles.btnFilter}
                            onClick={() => {
                                sendSearch({
                                    is_fabric: filterLabels.is_fabric,
                                    is_order: filterLabels.is_order,
                                    is_warehouse_item: !filterLabels.is_warehouse_item
                                }, 1)
                            }}>
                        <p>Склад</p>
                        <span/>
                    </button>
                </div>
            )}
        </>

    )
}

export default OrderSearchFilters;