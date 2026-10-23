import React from "react";
import styles from './MainTabs.module.scss';
import history from '../../../../assets/icons/history.svg';
import historyActive from '../../../../assets/icons/historyActive.svg';
import favorites from '../../../../assets/icons/favorites.svg';
import favoritesActive from '../../../../assets/icons/favoritesActive.svg';

const MainTabs = ({orders, setOrders, onChangeList, setPage}) => {
    const onSubmit = (value) => {
        if (orders !== value) {
            setOrders(value)
        }
    }

    return (
        <div className={styles.mainTabs}>
            <div className={styles.tabs}>
                <button className={orders === 'my' ? styles.tabActive : styles.tab}
                        onClick={() => {
                            onChangeList('my', 1)
                            onSubmit('my');
                            setPage(1);
                        }}>
                    <span>Мої замовлення</span>
                </button>
                <button className={orders === 'all' ? styles.tabActive : styles.tab}
                        onClick={() => {
                            onChangeList('all', 1)
                            onSubmit('all');
                            setPage(1);
                        }}>
                    <span>Всі замовлення</span>
                </button>
                <button className={orders === 'history' ? styles.tabActive : styles.tab}
                        onClick={() => {
                            onChangeList('history', 1);
                            onSubmit('history');
                            setPage(1);
                        }}>
                    <img src={orders === 'history' ? historyActive : history} alt=""/>
                </button>
                <button className={orders === 'favorite' ? styles.tabActive : styles.tab}
                        onClick={() => {
                            onChangeList('favorite', 1);
                            onSubmit('favorite');
                            setPage(1);
                        }}>
                    <img src={orders === 'favorite' ? favoritesActive : favorites} alt=""/>
                </button>
            </div>
            <p className={styles.line} />
        </div>
    )
}

export default MainTabs;