import React from "react";
import styles from '../ProductItem.module.scss';
import ImgPlaceholder from "../../../../assets/img/placeholder.svg";
import { useIsDesktop } from "../../../../hooks/useIsDesktop";
import InfoHint from "../InfoHint/InfoHint";
import {photoSkeleton} from "../../../../utils/photoSkeleton";
import { t } from '../../../../i18n';

const ClosedItem = ({ name = t('Невідомий продукт'), price = t('Не доступно'), images = [], components, fabric_type, kit_type, isClient, sourceName, originalSourceName }) => {
    const isDesktop = useIsDesktop();
    const hasComponents = Array.isArray(components) && components.length > 0;

    const hintText = !isClient
        ? sourceName && originalSourceName && sourceName !== originalSourceName
            ? t('Ціну цього товару було взято зі списку "{{original}}", хоча в самому замовленні джерело було змінено на "{{source}}"', {original: originalSourceName, source: sourceName})
            : sourceName
                ? t('Ціну було взято зі списку "{{source}}"', {source: sourceName})
                : t('Ціну було взято зі стандартного списку цін')
        : "";

    return (
        <React.Fragment>
            <div className={styles.closedWrap}>
                <img src={!images[0] ? ImgPlaceholder : images[0]} {...photoSkeleton(undefined, !!images[0])} alt="" />
                {isDesktop && <div className={styles.desktopWrap}>
                    <div className={`${isDesktop ? styles.desktopTitleBlock : ''}`}>
                        <p className={`${styles.closedWrap__title} ${styles.desktopTitle}`}>{name}</p>
                        <p>{price} {t('грн')}</p>
                    </div>
                    {hasComponents && fabric_type && <p>{t('Код тканини')}: {fabric_type}</p>}
                    {hasComponents && kit_type && <p>{t('Тип комплекту')}: {kit_type}</p>}
                </div>
                }
                {!isDesktop && <div>
                    <p className={styles.closedWrap__title}>{name}</p>
                    <div className={styles.priceRow}>
                        <p>{price} {t('грн')}</p>
                        {!isClient && <InfoHint text={hintText} />}
                    </div>
                </div>}
            </div>
        </React.Fragment>
    )
}

export default ClosedItem;