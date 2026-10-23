import React from "react";
import styles from '../ProductItem.module.scss';
import ImgPlaceholder from "../../../../assets/img/placeholder.svg";
import { useIsDesktop } from "../../../../hooks/useIsDesktop";
import InfoHint from "../InfoHint/InfoHint";

const ClosedItem = ({ name = 'Невідомий продукт', price = 'Не доступно', images = [], components, fabric_type, kit_type, isClient, sourceName, originalSourceName }) => {
    const isDesktop = useIsDesktop();
    const hasComponents = Array.isArray(components) && components.length > 0;

    const hintText = !isClient
        ? sourceName && originalSourceName && sourceName !== originalSourceName
            ? `Ціну цього товару було взято зі списку "${originalSourceName}", хоча в самому замовленні джерело було змінено на "${sourceName}"`
            : sourceName
                ? `Ціну було взято зі списку "${sourceName}"`
                : "Ціну було взято зі стандартного списку цін"
        : "";

    return (
        <React.Fragment>
            <div className={styles.closedWrap}>
                <img src={!images[0] ? ImgPlaceholder : images[0]} alt="" />
                {isDesktop && <div className={styles.desktopWrap}>
                    <div className={`${isDesktop ? styles.desktopTitleBlock : ''}`}>
                        <p className={`${styles.closedWrap__title} ${styles.desktopTitle}`}>{name}</p>
                        <p>{price} грн</p>
                    </div>
                    {hasComponents && fabric_type && <p>Код тканини: {fabric_type}</p>}
                    {hasComponents && kit_type && <p>Тип комплекту: {kit_type}</p>}
                </div>
                }
                {!isDesktop && <div>
                    <p className={styles.closedWrap__title}>{name}</p>
                    <div className={styles.priceRow}>
                        <p>{price} грн</p>
                        {!isClient && <InfoHint text={hintText} />}
                    </div>
                </div>}
            </div>
        </React.Fragment>
    )
}

export default ClosedItem;