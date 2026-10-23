import React, { useEffect, useRef, useState } from "react";
import styles from './StorageItem.module.scss';
import IconPlaceholder from "../../../assets/img/storage_item_icon_placeholder.svg";
import { CopyToClipboard } from "react-copy-to-clipboard";
import copyIcon from "../../../assets/icons/copy.svg";
import plus from "../../../assets/icons/plus.svg";
import closeIcon from "../../../assets/icons/closeCross.svg";
import PopupCheckboxes from "../PopupCheckboxes/PopupCheckboxes";
import { getBaseUrl } from "../../../store/selectors";
import Preloader from "../Preloader/Preloader";
import { setIsActivePopup } from "../../../store/main-slice";
import { useAppDispatch } from "../../../hooks/redux";
import { getAccessToken } from "../../../utils/authTokens";
import { setAddProduct } from "../../../api/productsApi";
import ImagePopup from "../ImagePopup/ImagePopup";

const StorageItem = ({ orderId, id, name, images, sizes, copy, setOrder = null, setPopup, inPopup, sourceID, onAfterProductAdd }) => {
    let basicCount = 4;
    const baseUrl = getBaseUrl;
    const dispatch = useAppDispatch();
    const [isLoading, setIsLoading] = useState(false);
    const [activeSizeIndex, setActiveSizeIndex] = useState(0);
    const [activeColorIndex, setActiveColorIndex] = useState(0);
    const initialSizes = sizes?.length > 0
        ? sizes.map(size => ({
            title: `${size.width}x${size.length}`,
            value: size.size_id
        }))
        : [];
    const initialColors = sizes[0]?.colors?.length > 0
        ? sizes[0].colors.map(color => ({ title: color.name, value: color.color_id }))
        : [];
    const [additionalSize, setAdditionalSize] = useState(initialSizes[0]?.value || '');
    const [additionalColor, setAdditionalColor] = useState(initialColors[0]?.value || '');
    const [isShowSizePopup, setIsShowSizePopup] = useState(false);
    const [isShowColorPopup, setIsShowColorPopup] = useState(false);
    const [sortedSizes, setSortedSizes] = useState(initialSizes);
    const [sortedColors, setSortedColors] = useState(initialColors);
    const [pending, setPending] = useState(false);
    const [showSizeApplied, setShowSizeApplied] = useState(false);
    const [showColorApplied, setShowColorApplied] = useState(false);
    const sizeHideTimerRef = useRef(null);
    const colorHideTimerRef = useRef(null);
    const quantity = sizes[activeSizeIndex]?.colors?.[activeColorIndex]?.quantity || 0;
    const currentPrice = inPopup
        ? sizes?.[activeSizeIndex]?.colors?.[activeColorIndex]?.price?.sell_price ?? null
        : null;
    const hasPrice = inPopup ? currentPrice != null : true;


    const [imagePopup, setImagePopup] = useState(null);

    const handleSizeClick = (sizeIndex, value) => {
        if (sizeIndex !== activeSizeIndex) {
            setActiveSizeIndex(sizeIndex);
            setAdditionalSize(value);
            const newSortedColors = sizes[sizeIndex]?.colors?.length > 0
                ? sizes[sizeIndex].colors.map(color => ({ title: color.name, value: color.color_id }))
                : [];
            setSortedColors(newSortedColors);
            setAdditionalColor(newSortedColors[0]?.value || '');
            setActiveColorIndex(0);
        }
    };

    const handleAdditionalSize = (value) => {
        let newSize = value.value;
        setAdditionalSize(newSize);
        const index = initialSizes.findIndex(size => size.value === newSize);

        if (index !== -1) {
            if (!initialSizes.slice(0, basicCount).some(size => size.value === newSize)) {
                let changedSizes = [...initialSizes];
                changedSizes.splice(index, 1);
                changedSizes.unshift(value);
                setSortedSizes(changedSizes);
                setActiveSizeIndex(0);
            } else {
                setSortedSizes(initialSizes);
                setActiveSizeIndex(index);
            }

            const newColors = sizes[index]?.colors?.length > 0
                ? sizes[index].colors.map(color => ({ title: color.name, value: color.color_id }))
                : [];

            setSortedColors(newColors);
            setAdditionalColor(newColors[0]?.value || '');
            setActiveColorIndex(0);
        }

        setShowSizeApplied(true);

        if (sizeHideTimerRef.current) {
            clearTimeout(sizeHideTimerRef.current);
        }

        sizeHideTimerRef.current = setTimeout(() => {
            setShowSizeApplied(false);
        }, 1800);
    };

    const handleColorClick = (colorIndex, value) => {
        if (colorIndex !== activeColorIndex) {
            setActiveColorIndex(colorIndex);
            setAdditionalColor(value);
        }
    };

    const handleAdditionalColor = (value) => {
        let newColor = value.value;
        setAdditionalColor(newColor);

        const currentColors = sizes?.[activeSizeIndex]?.colors?.length > 0
            ? sizes[activeSizeIndex].colors.map(color => ({
                title: color.name,
                value: color.color_id
            }))
            : [];

        const index = currentColors.findIndex(color => color.value === newColor);

        if (index !== -1) {
            if (!currentColors.slice(0, basicCount).some(color => color.value === newColor)) {
                let changedColors = [...currentColors];
                changedColors.splice(index, 1);
                changedColors.unshift(value);
                setSortedColors(changedColors);
                setActiveColorIndex(0);
            } else {
                setSortedColors(currentColors);
                setActiveColorIndex(index);
            }
        }

        setShowColorApplied(true);

        if (colorHideTimerRef.current) {
            clearTimeout(colorHideTimerRef.current);
        }

        colorHideTimerRef.current = setTimeout(() => {
            setShowColorApplied(false);
        }, 1800);
    };
    const openSizePopup = () => {
        setIsShowSizePopup(true);
    }

    const closeSizePopup = () => {
        setIsShowSizePopup(false);
        setShowSizeApplied(false);

        if (sizeHideTimerRef.current) {
            clearTimeout(sizeHideTimerRef.current);
        }
    }

  const openColorPopup = () => {
    const currentPopupColor = sortedColors?.[activeColorIndex]?.value || '';
    setAdditionalColor(currentPopupColor);
    setIsShowColorPopup(true);
};

    const closeColorPopup = () => {
        setIsShowColorPopup(false);
        setShowColorApplied(false);

        if (colorHideTimerRef.current) {
            clearTimeout(colorHideTimerRef.current);
        }
    }

    const showImagePopup = (imgURL) => {
        setImagePopup(imgURL);
    }

    const closeImagePopup = () => {
        setImagePopup(null);
    }


    const onAddProduct = () => {
        setIsLoading(true);
        setPending(true);

        const accessToken = getAccessToken();

        const currentSize = sizes?.[activeSizeIndex];
        const currentColor = currentSize?.colors?.[activeColorIndex];


        if (!currentSize || !currentColor) {
            console.error('Неможливо визначити розмір або колір для товару', { sizes, activeSizeIndex, activeColorIndex });
            alert('Не вдалося визначити розмір або колір товару. Спробуй ще раз.');
            setIsLoading(false);
            setPending(false);
            return;
        }

        if (inPopup && !currentColor?.price) {
            setIsLoading(false);
            setPending(false);
            return;
        }

        const typeId = currentColor.type_id;

        const warehouseItem = {
            template: id,
            source: sourceID,
            type: typeId,
        };

        console.log('warehouseItem payload:', warehouseItem);

        setAddProduct(accessToken, orderId, warehouseItem).then(async (response) => {
            if (response?.id) {
                setOrder(prevProducts => [...prevProducts, response]);

                if (onAfterProductAdd) {
                    await onAfterProductAdd();
                }

                setPopup(false);
                dispatch(setIsActivePopup(false));
            }

            // if (response?.price && response?.price === 'Source price for this source was not found') {
            //     alert('Не знайдено ціни товару по вказаному джерелу');
            // }

            const warehousePriceError =
                response?.errors?.['warehouse item price'] ||
                response?.errors?.warehouse_item_price;

            if (warehousePriceError) {
                alert(`Додайте, будь ласка, ціну для даного товару, щоб мати можливість його додати`);
                return;
            }

            if (response?.errors && !warehousePriceError) {
                const firstError = Object.values(response.errors)[0];
                if (firstError) {
                    alert(`Помилка при додаванні товару: ${firstError}`);
                }
            }

        }).finally(() => {
            setIsLoading(false);
            setPending(false);
        });
    };

    useEffect(() => {
        return () => {
            if (sizeHideTimerRef.current) {
                clearTimeout(sizeHideTimerRef.current);
            }

            if (colorHideTimerRef.current) {
                clearTimeout(colorHideTimerRef.current);
            }
        };
    }, []);


    return (
        <div className={`${styles.storageItem} ${inPopup ? styles.inPopup : ''}`}>
            <div className={styles.infoWrap}>
                <div className={styles.titleWrap}>
                    {images?.length ? <img src={images[0]} className={styles.itemImg} alt=""
                        onClick={() => showImagePopup(images[0])} /> :
                        <span className={styles.iconWrap}><img src={IconPlaceholder} alt="" /></span>}
                    <div>
                        <h3>{name}</h3>
                        <p className={quantity < 10 ? styles.balanceWarning : ''}>Залишок {quantity}</p>
                        {inPopup && hasPrice && (
                            <p>{currentPrice} грн</p>
                        )}
                    </div>
                </div>
                {copy ? <CopyToClipboard text={`${baseUrl}/product/?storageId=${id}`} className="click-effect">
                    <button tabIndex={0}>
                        <img src={copyIcon} alt="" />
                    </button>
                </CopyToClipboard> :
                    <div className={styles.addWrap}>
                        <button
                            onClick={() => onAddProduct()}
                            disabled={pending || !hasPrice}
                        >
                            <img src={plus} alt="" />
                        </button>
                        <span>Додати</span>
                    </div>}
            </div>
            {sortedSizes?.length > 0 && (
                <div className={styles.optionsWrap}>
                    <div>
                        {sortedSizes.slice(0, basicCount).map((el, index) => (
                            <span
                                key={index}
                                className={`${activeSizeIndex === index ? styles.active : ""}`}
                                onClick={() => handleSizeClick(index, el.value)}
                            >
                                <p>{el.title}</p>
                            </span>
                        ))}
                        {initialSizes.length > 4 && (
                            <span className={styles.additional} onClick={() => openSizePopup()}>
                                <p>+{initialSizes.length - basicCount}</p>
                            </span>
                        )}
                    </div>
                    {sortedColors?.length > 0 && (
                        <div className={styles.colorsRow}>
                            {sortedColors.slice(0, basicCount).map((el, index) => (
                                <span
                                    key={index}
                                    className={`${activeColorIndex === index ? styles.active : ""}`}
                                    onClick={() => handleColorClick(index, el.value)}
                                    style={{
                                        backgroundColor: el.title,
                                        borderColor: activeColorIndex === index ? '' : el.title
                                    }}
                                >
                                </span>
                            ))}
                            {sortedColors.length > 4 && (
                                <span className={styles.additional} onClick={() => openColorPopup()}>
                                    <p>+{sortedColors.length - basicCount}</p>
                                </span>
                            )}
                        </div>
                    )}
                </div>
            )}
            {inPopup && !hasPrice && (
                <p className={styles.priceWarning}>
                    Цей товар не можна додати в замовлення, адже йому не задана ціна
                </p>
            )}
            {(isShowSizePopup || isShowColorPopup) && (
                <span
                    className={styles.shadowActive}
                    onClick={() => {
                        closeSizePopup();
                        closeColorPopup();
                    }}
                />
            )}
            {isShowSizePopup && (
                <div className={isShowSizePopup ? `${styles.globalPopupActive} ${styles.topPopup}` : styles.globalPopup}>
                    <div className={styles.header}>
                        <p className={styles.header__title}>Вказати розмір:</p>
                        <div className={styles.header__close} onClick={() => closeSizePopup()}>
                            <span>Закрити</span>
                            <button>
                                <img src={closeIcon} alt="" />
                            </button>
                        </div>
                    </div>
                    <div className={styles.globalPopup__content}>
                        {showSizeApplied && (
                            <p className={styles.appliedMessage}>Зміни застосовано</p>
                        )}

                        <PopupCheckboxes values={additionalSize} setValues={handleAdditionalSize}
                            chooseList={initialSizes} isRadio />
                    </div>
                </div>
            )}
            {isShowColorPopup && (
                <div className={isShowColorPopup ? `${styles.globalPopupActive} ${styles.topPopup}` : styles.globalPopup}>
                    <div className={styles.header}>
                        <p className={styles.header__title}>Вказати колір:</p>
                        <div className={styles.header__close} onClick={() => closeColorPopup()}>
                            <span>Закрити</span>
                            <button>
                                <img src={closeIcon} alt="" />
                            </button>
                        </div>
                    </div>
                    <div className={styles.globalPopup__content}>
                        {showColorApplied && (
                            <p className={styles.appliedMessage}>Зміни застосовано</p>
                        )}
                        <PopupCheckboxes values={additionalColor} setValues={handleAdditionalColor}
                            chooseList={sortedColors} isRadio />
                    </div>
                </div>
            )}
            {
                imagePopup && <ImagePopup img={imagePopup} onClose={closeImagePopup} isShowImagePopup={!!imagePopup} />
            }
            {isLoading && (
                <div className={styles.preloader}>
                    <Preloader />
                </div>
            )}
        </div>
    )
}

export default React.memo(StorageItem);