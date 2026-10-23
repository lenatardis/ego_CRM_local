import React, { useEffect, useRef, useState } from "react";
import PopupCheckboxes from "../../../../Common/PopupCheckboxes/PopupCheckboxes";
import styles from "./OptionPopup.module.scss";

const OptionPopup = ({
    item,
    chosenOptions,
    setChosenOptions,
    onChangeOptions,
    componentIndex,
    isCustom
}) => {
    const optionsInfo = item?.options || [];
    const [initialOptions, setInitialOptions] = useState([]);
    const [items, setItems] = useState([]);
    const [showApplied, setShowApplied] = useState(false);
    const hideTimerRef = useRef(null);

    useEffect(() => {
        let formattedOptions = [];
        let formattedChosenOptions = [];

        if (Array.isArray(optionsInfo)) {
            formattedOptions = optionsInfo.map((el) => ({
                value: `${el.name}`,
                title: `${el.name}`,
                id: Number(el.id),
                price: el.price,
            }));
        }

        if (Array.isArray(chosenOptions)) {
            formattedChosenOptions = chosenOptions.map((el) => ({
                value: `${el.name}`,
                title: `${el.name}`,
                id: Number(el.id),
                price: el.price,
            }));
        }

        setInitialOptions(formattedOptions);
        setItems(formattedChosenOptions);
    }, [item]);

    useEffect(() => {
        const formattedItems = items.map((el) => ({
            id: Number(el.id),
            name: el.value,
            price: el.price,
        }));

        setChosenOptions(formattedItems);

        const changedOptions = items.map((el) => el.id);
        onChangeOptions(changedOptions, componentIndex, "option", isCustom);
    }, [items]);

    useEffect(() => {
        return () => {
            if (hideTimerRef.current) {
                clearTimeout(hideTimerRef.current);
            }
        };
    }, []);

    const handleSetItems = (value) => {
        setItems(value);
        setShowApplied(true);

        if (hideTimerRef.current) {
            clearTimeout(hideTimerRef.current);
        }

        hideTimerRef.current = setTimeout(() => {
            setShowApplied(false);
        }, 1500);
    };

    return (
        <div className={styles.optionPopup}>
            {showApplied && (
                <p className={styles.appliedMessage}>Зміни застосовано</p>
            )}

            <PopupCheckboxes
                values={items}
                setValues={handleSetItems}
                chooseList={initialOptions}
            />
        </div>
    );
};

export default OptionPopup;