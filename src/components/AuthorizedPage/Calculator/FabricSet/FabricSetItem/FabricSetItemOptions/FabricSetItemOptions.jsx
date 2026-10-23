import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import styles from '../../FabricSet.module.scss';

const FabricSetItemOptions = ({
                                  chosenOptions,
                                  setChosenOptions,
                                  item,
                                  componentIndex,
                                  onChangeOptions,
                                  setContainerPosition,
                                  isCustom
                              }) => {
    const optionsInfo = item?.options || [];

    const noPriceText =
        "Ви не можете вибрати опцію без ціни, бо вона не вказана в списку цін";

    const [hint, setHint] = useState(null);
    const timerRef = useRef(null);

    const closeHint = () => setHint(null);

    useEffect(() => {
        const onDocDown = () => closeHint();
        document.addEventListener("mousedown", onDocDown);
        document.addEventListener("touchstart", onDocDown);
        return () => {
            document.removeEventListener("mousedown", onDocDown);
            document.removeEventListener("touchstart", onDocDown);
        };
    }, []);

    useEffect(() => {
        return () => {
            if (timerRef.current) window.clearTimeout(timerRef.current);
        };
    }, []);

    const showNoPriceHint = (optionId, targetEl) => {
        const rect = targetEl.getBoundingClientRect();

        const spaceAbove = rect.top;
        const spaceBelow = window.innerHeight - rect.bottom;

        const placement = spaceAbove >= 120 || spaceAbove > spaceBelow ? "top" : "bottom";

        const x = rect.left + rect.width / 2;
        const y = placement === "top" ? rect.top - 8 : rect.bottom + 8;

        setHint({ id: optionId, x, y, placement });

        if (timerRef.current) window.clearTimeout(timerRef.current);
        timerRef.current = window.setTimeout(() => setHint(null), 3000);
    };

    const handleOptionClick = (option, e) => {
        setContainerPosition(2);

        if (Number(option.price) === 0) {
            e.preventDefault();
            e.stopPropagation();
            showNoPriceHint(option.id, e.currentTarget);
            return;
        }

        if (hint) setHint(null);

        if (chosenOptions.some((el) => el.id === option.id)) {
            const filteredArr = chosenOptions.filter((el) => el.id !== option.id);
            setChosenOptions(filteredArr);
        } else {
            setChosenOptions([...chosenOptions, { name: option.name, id: option.id, price: option.price }]);
        }

        onChangeOptions(option.id, componentIndex, "option", isCustom);
    };

    return (
        <div>
            {optionsInfo.length > 0 && <span>Опції:</span>}

            <div className={styles.optionGroup}>
                {optionsInfo.map((el, index) => {
                    const isDisabled = Number(el.price) === 0;
                    const isActive = chosenOptions.some((opt) => opt.id === el.id);

                    return (
                        <button
                            type="button"
                            key={el.id ?? index}
                            className={`${isDisabled ? styles.optionDisabled : styles.option} ${isActive ? styles.active : ""}`}
                            onClick={(e) => handleOptionClick(el, e)}
                            aria-disabled={isDisabled ? "true" : "false"}
                        >
                            <span>{`${el.name} (${el.price} грн)`}</span>
                        </button>
                    );
                })}
            </div>

            {hint &&
                createPortal(
                    <div
                        className={`${styles.optionHint} ${
                            hint.placement === "top" ? styles.optionHintTop : styles.optionHintBottom
                        }`}
                        style={{ left: `${hint.x}px`, top: `${hint.y}px` }}
                        role="tooltip"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {noPriceText}
                    </div>,
                    document.body
                )}
        </div>
    );
};

export default FabricSetItemOptions;