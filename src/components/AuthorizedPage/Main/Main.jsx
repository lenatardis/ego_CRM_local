import React, {useEffect, useState} from "react";
import styles from './Main.module.scss';
import UserHeader from "./UserHeader/UserHeader";
import MainTabs from "./MainTabs/MainTabs";
import {useAppDispatch, useAppSelector} from "../../../hooks/redux";
import {useIsDesktop} from "../../../hooks/useIsDesktop";
import {getOrderList, getUser} from "../../../store/selectors";
import Order from "./Order/Order";
import {setOrders} from "../../../store/main-slice";
import OrderSearchFilters from "./OrderSearchFilters/OrderSearchFilters";
import {Pagination} from "@mui/material";
import Preloader from "../../Common/Preloader/Preloader";
import {getAccessToken} from "../../../utils/authTokens";
import {getOrders, getOrdersRecentViews} from "../../../api/ordersApi";
import ArrBack from "../../Common/ArrBack/ArrBack";


const Main = () => {
    const [isLoading, setIsLoading] = useState(false);
    const orderList = useAppSelector(getOrderList);
    const {id} = useAppSelector(getUser);
    const [ordersFilter, setOrdersFilter] = useState('my');
    const [searchValue, setSearchValue] = useState('');
    const [filterLabels, setFilterLabels] = useState(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const dispatch = useAppDispatch();
    const isDesktop = useIsDesktop();
   
    useEffect(() => {
        if (id) {
            const accessToken = getAccessToken();
            setIsLoading(true);
            const params = {page: 1, manager: id, is_general: true};
            getOrders(accessToken, params).then(result => {
                if (result?.orders && result.orders.length > 0) {
                    dispatch(setOrders(result.orders));
                    setTotalPages(result.total_pages);
                    setIsLoading(false);
                }
            }).finally(() => {
                setIsLoading(false);
            });
        }
    }, [id])

    const onResetSearch = () => {
        setSearchValue('');
        setFilterLabels(null)
    }

    const onChangeList = (filter, pageValue) => {
        if (filter) {
            setIsLoading(true);
            const accessToken = getAccessToken();
            if (filter === 'all') {
                getOrders(accessToken, {page: pageValue, is_general: true}).then(result => {
                    if (result?.orders && result.orders.length > 0) {
                        dispatch(setOrders(result.orders));
                    } else {
                        dispatch(setOrders([]));
                    }
                    setTotalPages(result.total_pages);
                }).finally(() => {
                    setIsLoading(false);
                });
                onResetSearch()
            }
            if (filter === 'my') {
                getOrders(accessToken, {page: pageValue, manager: id, is_general: true}).then(result => {
                    if (result?.orders && result.orders.length > 0) {
                        dispatch(setOrders(result.orders));
                    } else {
                        dispatch(setOrders([]));
                    }
                    setTotalPages(result.total_pages);
                }).finally(() => {
                    setIsLoading(false);
                });
                onResetSearch()
            }
            if (filter === 'favorite') {
                getOrders(accessToken, {
                    page: pageValue,
                    manager: id,
                    is_favourite: true,
                    is_general: true
                }).then(result => {
                    if (result?.orders && result.orders.length > 0) {
                        dispatch(setOrders(result.orders));
                    } else {
                        dispatch(setOrders([]));
                    }
                    setTotalPages(result.total_pages);
                }).finally(() => {
                    setIsLoading(false);
                });
                onResetSearch()
            }
            if (filter === 'history') {
                getOrdersRecentViews(accessToken, id).then(result => {
                    if (result?.orders && result.orders.length > 0) {
                        dispatch(setOrders(result.orders));
                    } else {
                        dispatch(setOrders([]));
                    }
                    setTotalPages(result.total_pages);
                }).finally(() => {
                    setIsLoading(false);
                });
                onResetSearch()
            }
        }
    }

    const handlePaginationChange = (event, value) => {
        if (page !== value) {
            setPage(value);
            window.scrollTo({top: 0, behavior: 'auto'});
            if (searchValue === '') {
                onChangeList(ordersFilter, value)
            }
        }
    }

    const handleSearchText = (text) => {
        if (/[^a-zа-яґєії0-9+\-'_. ]+/ig.test(text) && text !== '') {
            return;
        }
        setSearchValue(text);
    }

    return (
        <div className={styles.main}>
            <div className={styles.mainWrap}>
                {isDesktop && <ArrBack/>}
                <div className={styles.upperPanel}>
                    <UserHeader/>
                    <OrderSearchFilters setOrdersFilter={setOrdersFilter} searchValue={searchValue}
                                        setSearchValue={handleSearchText} filterLabels={filterLabels}
                                        setFilterLabels={setFilterLabels} setPage={setPage}
                                        setTotalPages={setTotalPages}
                                        page={page} onResetSearchList={() => onChangeList(ordersFilter, 1)}/>
                </div>
                <MainTabs orders={ordersFilter} setOrders={setOrdersFilter} onChangeList={onChangeList}
                          setPage={setPage}/>
                {orderList && orderList.length > 0 && (
                    <div className={styles.orderWrapper}>
                        {orderList.map((item, index) => (
                            <Order key={index} item={item} tabName={ordersFilter}/>
                        ))}
                    </div>
                )}
                {totalPages > 1 && (
                    <Pagination className={styles.mainPagination} count={totalPages} page={page} siblingCount={1}
                                boundaryCount={1} hidePrevButton hideNextButton onChange={handlePaginationChange}/>
                )}
                {isLoading && (
                    <Preloader/>
                )}
            </div>
        </div>
    )
}

export default Main;