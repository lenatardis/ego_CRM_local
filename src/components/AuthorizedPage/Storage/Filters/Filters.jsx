import { Filter } from "./Filter";
import styles from "./filters.module.scss";
import removeFiltersIcon from "../../../../assets/icons/filter-remove-icon.svg";
import { t } from '../../../../i18n';
import { useEffect, useRef, useState } from "react";
import { useIsDesktop } from "../../../../hooks/useIsDesktop";

export const Filters = ({
    filters,
    onChange,
    removeFilters,
    selected,
    isInStockOnly,
    onToggleInStock,
    eyeIcon,
    eyeClosedIcon,
    inPopup
}) => {
    // Demo build (at the user's request, same as Тканини): phones have no hover, so the eye's `title` never shows
    // there – a tap switches the filter and shows what is displayed now in a bubble under the button for a moment
    const isDesktop = useIsDesktop();
    const [eyeHint, setEyeHint] = useState(null);
    const eyeHintTimer = useRef(null);
    useEffect(() => () => clearTimeout(eyeHintTimer.current), []);
    const handleToggleInStock = (e) => {
        if (!isDesktop) {
            clearTimeout(eyeHintTimer.current);
            setEyeHint(!isInStockOnly ? t('Відображаються тільки товари в наявності') : t('Відображаються всі товари'));
            eyeHintTimer.current = setTimeout(() => setEyeHint(null), 2500);
        }
        onToggleInStock(e);
    };

    return (
        <ul className={styles.filters}>
            {filters.map((item, index) => (
                <Filter key={index} item={item} onChange={onChange} isActive={selected.includes(item.id)} />
            ))}

            <button className={styles.filters__removeFilters} onClick={removeFilters}>
                <img src={removeFiltersIcon} alt="" />
            </button>

            {!inPopup  && (<label
                className={styles.filters__eye}
                title={
                    isInStockOnly
                        ? t('Відображаються тільки товари в наявності')
                        : t('Відображаються всі товари')
                }
            >
                <img
                    src={isInStockOnly ? eyeClosedIcon : eyeIcon}
                    alt=""
                />
                <input
                    type="checkbox"
                    checked={isInStockOnly}
                    onChange={handleToggleInStock}
                />
                {eyeHint && <span className={styles.filters__eyeHint} role="status">{eyeHint}</span>}
            </label>)}
        </ul>
    )
}