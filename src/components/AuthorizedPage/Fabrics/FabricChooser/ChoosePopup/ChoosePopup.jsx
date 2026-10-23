import React, { useEffect, useRef, useState } from "react";
import styles from './ChoosePopup.module.scss';
import FabricChooseItem from "./FabricChooseItem";

const ChoosePopup = ({ fabricFilters, handleChange, selectedFabric, type }) => {
    const [showApplied, setShowApplied] = useState(false);
    const hideTimerRef = useRef(null);

    const handleItemChange = (item) => {
        handleChange(item);
        setShowApplied(true);

        if (hideTimerRef.current) {
            clearTimeout(hideTimerRef.current);
        }

        hideTimerRef.current = setTimeout(() => {
            setShowApplied(false);
        }, 2000);
    };

    useEffect(() => {
        return () => {
            if (hideTimerRef.current) {
                clearTimeout(hideTimerRef.current);
            }
        };
    }, []);

    return (
        <div className={`${styles.chooserPopup} ${type ? styles.typePopup : ""}`}>
            {showApplied && (
                <p className={styles.appliedMessage}>Зміни застосовано</p>
            )}

            {fabricFilters && fabricFilters.length > 0 && (
                fabricFilters.map((item, index) => (
                    <FabricChooseItem
                        key={index}
                        item={item}
                        handleChange={handleItemChange}
                        selectedFabric={selectedFabric}
                    />
                ))
            )}
        </div>
    );
};

export default ChoosePopup;