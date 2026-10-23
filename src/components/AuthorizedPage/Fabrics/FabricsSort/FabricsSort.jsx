import React, { useEffect, useRef, useState } from "react";
import { SortItem } from "./SortItem";
import styles from "./fabricSort.module.scss";

export const FabricsSort = ({ sortOptions, selectedSortParam, setSortParam }) => {
    const [showApplied, setShowApplied] = useState(false);
    const hideTimerRef = useRef(null);

    const handleSortChange = (value) => {
        setSortParam(value);
        setShowApplied(true);

        if (hideTimerRef.current) {
            clearTimeout(hideTimerRef.current);
        }

        hideTimerRef.current = setTimeout(() => {
            setShowApplied(false);
        }, 1800);
    };

    useEffect(() => {
        return () => {
            if (hideTimerRef.current) {
                clearTimeout(hideTimerRef.current);
            }
        };
    }, []);

    return (
        <>
            {showApplied && (
                <p className={styles.appliedMessage}>Зміни застосовано</p>
            )}

            <ul className={styles.fabricSortList}>
                {sortOptions.length > 0 && sortOptions.map((item, idx) => (
                    <SortItem
                        key={idx}
                        item={item}
                        isSelected={item.name === selectedSortParam}
                        onChange={handleSortChange}
                    />
                ))}
            </ul>
        </>
    );
};