import React, { useEffect, useMemo, useRef, useState } from "react";
import styles from "../FabricSet.module.scss";
import OptionButton from "../OptionButton/OptionButton";
import CommentIcon from "../../../../../assets/icons/comment.svg";
import OptionIcon from "../../../../../assets/icons/options.svg";
import ReturnIcon from "../../../../../assets/icons/return.svg";
import EditSet from "../../../../../assets/icons/editSet.svg";
import DeleteSet from "../../../../../assets/icons/bin.svg";
import CommentPopup from "../../Popups/CommentPopup/CommentPopup";
import FabricSetItemSize from "./FabricSetItemSize/FabricSetItemSize";
import FabricSetItemType from "./FabricSetItemType/FabricSetItemType";
import FabricSetItemOptions from "./FabricSetItemOptions/FabricSetItemOptions";
import CustomSizePopup from "../../Popups/CustomSizePopup/CustomSizePopup";
import OptionPopup from "../../Popups/OptionPopup/OptionPopup";
import { useAppDispatch } from "../../../../../hooks/redux";
import { setIsActivePopup } from "../../../../../store/main-slice";
import GlobalPopup from "../../../../Common/GlobalPopup/GlobalPopup";
import { useIsDesktop } from "../../../../../hooks/useIsDesktop";

const FabricSetItem = ({
                           inPopup,
                           item,
                           types,
                           componentIndex,
                           onChangeOptions,
                           form,
                           onDelete = () => {},
                           isEdit,
                           componentSize,
                           onSelectSize,
                           onSelectMonoFabricType = () => {},
                           isKitSplitted = false,
                           defaultFabricImage = "",
                           isCustom,
                       }) => {
    const dispatch = useAppDispatch();
    const isDesktop = useIsDesktop();

    const formKey = isCustom ? "additional_components" : "template_components";
    const formItem = form?.[formKey]?.[componentIndex];

    const currentSelectedOptionIds = useMemo(() => {
        return Array.isArray(formItem?.option) ? formItem.option : [];
    }, [formItem?.option]);

    const customSizeStr = useMemo(() => {
        const v = formItem?.custom_size;
        if (!v) return "";
        if (typeof v === "string") return v;
        return String(v.size || v.name || v.value || "");
    }, [formItem?.custom_size]);

    const stripSizeFromEnd = (s) =>
        String(s || "").replace(/\s*\d+\s*[xхXХ]\s*\d+\s*$/u, "").trim();

    const extractSizeFromText = (s) => {
        const m = String(s || "").match(/(\d+\s*[xхXХ]\s*\d+)/u);
        return m ? m[1].replace(/\s+/g, "") : "";
    };

    const selectedSizeIndex = useMemo(() => {
        if (!componentSize?.sizes?.length) return null;

        if (customSizeStr) {
            const normCustom = customSizeStr.replace(/\s+/g, "").toLowerCase();
            const idx = componentSize.sizes.findIndex((s) => {
                const size = String(s?.size || "").replace(/\s+/g, "").toLowerCase();
                const name = String(s?.name || "").replace(/\s+/g, "").toLowerCase();
                return size === normCustom || name.includes(normCustom);
            });
            if (idx !== -1) return idx;
        }

        return typeof componentSize.selected === "number" ? componentSize.selected : 0;
    }, [componentSize, customSizeStr]);

    const pickedSizeObj =
        componentSize?.sizes?.length && selectedSizeIndex !== null
            ? componentSize.sizes[selectedSizeIndex]
            : null;

    const displaySize = useMemo(() => {
        if (customSizeStr) return customSizeStr;

        if (pickedSizeObj?.size) return String(pickedSizeObj.size);

        const fromName = extractSizeFromText(pickedSizeObj?.name || item?.name);
        if (fromName) return fromName;

        return item?.size?.name || item?.size || "";
    }, [customSizeStr, pickedSizeObj, item]);

    const baseName = useMemo(() => {
        const rawName = pickedSizeObj?.name || item?.name || "Невідома назва";
        return stripSizeFromEnd(rawName);
    }, [pickedSizeObj?.name, item?.name]);

    const name = displaySize ? `${baseName} ${displaySize}` : baseName;

    const price = Number(pickedSizeObj?.price ?? item?.price ?? 0);

    const image =
        (pickedSizeObj?.image
            ? pickedSizeObj.image
            : Array.isArray(item?.image)
                ? item?.image[0]
                : item?.image) || defaultFabricImage;

    const [containerPosition, setContainerPosition] = useState(2);
    const [touchStartX, setTouchStartX] = useState(0);
    const [touchEndX, setTouchEndX] = useState(0);
    const containerRef = useRef(null);
    const leftHiddenLinkRef = useRef(null);
    const rightHiddenLinkRef = useRef(null);

    const [showCommentPopup, setShowCommentPopup] = useState(false);
    const [showCustomSizePopup, setShowCustomSizePopup] = useState(false);
    const [showOptionPopup, setShowOptionPopup] = useState(false);

    const [chosenOptions, setChosenOptions] = useState([]);

    const totalPrice = useMemo(
        () => price + chosenOptions.reduce((acc, option) => acc + Number(option.price || 0), 0),
        [price, chosenOptions]
    );

    const handleReturn = () => {
        setContainerPosition(2);
    };

    const handleCommentPopup = () => {
        setContainerPosition(2);
        setShowCommentPopup(true);
        dispatch(setIsActivePopup(true));
    };

    const closeCommentPopup = () => {
        setShowCommentPopup(false);
        dispatch(setIsActivePopup(false));
    };

    const handleCustomSizePopup = () => {
        setContainerPosition(2);
        setShowCustomSizePopup(true);
        dispatch(setIsActivePopup(true));
    };

    const closeCustomSizePopup = () => {
        setShowCustomSizePopup(false);
        dispatch(setIsActivePopup(false));
    };

    const handleOptionPopup = () => {
        setContainerPosition(2);
        setShowOptionPopup(true);
        dispatch(setIsActivePopup(true));
    };

    const closeOptionPopup = () => {
        setShowOptionPopup(false);
        dispatch(setIsActivePopup(false));
    };

    const handleTouchStart = (e) => {
        setTouchStartX(e.targetTouches[0].clientX);
        setTouchEndX(e.targetTouches[0].clientX);
    };

    const handleTouchMove = (e) => {
        setTouchEndX(e.targetTouches[0].clientX);
    };

    const handleTouchEnd = () => {
        if (touchStartX - touchEndX < -50 && containerPosition > 1) {
            setContainerPosition(containerPosition - 1);
        } else if (touchStartX - touchEndX > 50 && containerPosition < 3) {
            setContainerPosition(containerPosition + 1);
        }
    };

    const handleSelectSize = (sizeIndex) => {
        if (customSizeStr) {
            onChangeOptions('', componentIndex, 'custom_size', isCustom);
        }
        onSelectSize(componentIndex, sizeIndex);
    };

    const handleDeleteComponent = (itemId) => {
        setContainerPosition(2);
        onDelete(componentIndex, itemId);
    };

    useEffect(() => {
        const optionsInfo = item?.options || [];

        const selectedOptionArr = optionsInfo
            .filter((el) =>
                currentSelectedOptionIds.some((id) => Number(id) === Number(el?.id))
            )
            .map((el) => ({
                name: el.name,
                id: el.id,
                price: Number(el.price || 0),
            }));

        setChosenOptions(selectedOptionArr);
    }, [item?.options, currentSelectedOptionIds]);

    useEffect(() => {
        if (isDesktop) return;

        const handleClickOutside = (event) => {
            const container = containerRef.current;
            const leftBtn = leftHiddenLinkRef.current;
            const rightBtn = rightHiddenLinkRef.current;

            if (!container || !leftBtn || !rightBtn) return;

            if (
                !container.contains(event.target) &&
                !leftBtn.contains(event.target) &&
                !rightBtn.contains(event.target)
            ) {
                setContainerPosition(2);
            }
        };

        document.addEventListener("touchstart", handleClickOutside);
        return () => document.removeEventListener("touchstart", handleClickOutside);
    }, [isDesktop]);

    return (
        <div className={styles.wrapper}>
            <div
                className={styles.content}
                style={
                    !isDesktop
                        ? { left: containerPosition === 1 ? "0" : containerPosition === 3 ? "-92px" : "-46px" }
                        : {}
                }
                onTouchStart={!isDesktop ? handleTouchStart : undefined}
                onTouchMove={!isDesktop ? handleTouchMove : undefined}
                onTouchEnd={!isDesktop ? handleTouchEnd : undefined}
                ref={containerRef}
            >
                <button onClick={handleCustomSizePopup} className={styles.hiddenLeftBtn} ref={leftHiddenLinkRef}>
                    <img src={EditSet} alt="" />
                </button>

                <div className={`${styles.setWrap} ${inPopup ? styles.inPopup : ""}`}>
                    <div className={styles.set}>
                        <div className={styles.mainRow}>
                            <div className={styles.set__color} onClick={() => setContainerPosition(2)}>
                                <img className={styles.colorCover} src={image} alt="" />
                            </div>

                            <div className={styles.set__panel}>
                                <div className={`${styles.grid} ${styles.titleRow}`}>
                                    <p className={styles.name}>{name}:</p>

                                    {(!componentSize || isKitSplitted) && <p className={styles.price}>{totalPrice} грн</p>}

                                    <OptionButton img={CommentIcon} action={!inPopup ? handleCommentPopup : () => setContainerPosition(2)} />
                                </div>

                                <div className={`${styles.row} ${styles.featureRow}`}>
                                    <div className={styles.sizesWrapper}>
                                        {componentSize && componentSize?.sizes?.length > 0 ? (
                                            componentSize.sizes.map((it, idx) => {
                                                const isActive = selectedSizeIndex === idx;
                                                const label = isActive && customSizeStr ? customSizeStr : it.size;

                                                return (
                                                    <FabricSetItemSize
                                                        key={idx}
                                                        size={label}
                                                        isActive={isActive}
                                                        setContainerPosition={setContainerPosition}
                                                        onSelectSize={() => handleSelectSize(idx)}
                                                    />
                                                );
                                            })
                                        ) : (
                                            <FabricSetItemSize
                                                size={customSizeStr || item?.size?.name || item.size}
                                                isActive
                                                setContainerPosition={setContainerPosition}
                                            />
                                        )}
                                    </div>

                                    {!isDesktop && (
                                        <FabricSetItemType
                                            types={item?.mono_fabric_type ? item?.mono_fabric_type.split("") : types}
                                            setMonoFabricType={onSelectMonoFabricType}
                                            isChangeble={types?.length > 1}
                                            setContainerPosition={setContainerPosition}
                                        />
                                    )}

                                    {isDesktop && (
                                        <div className={styles.desktopPanel}>
                                            <div className={styles.optionRow}>
                                                <FabricSetItemOptions
                                                    item={item}
                                                    chosenOptions={chosenOptions}
                                                    setChosenOptions={setChosenOptions}
                                                    componentIndex={componentIndex}
                                                    onChangeOptions={onChangeOptions}
                                                    isCustom={isCustom}
                                                    setContainerPosition={setContainerPosition}
                                                />
                                                {item?.options?.length > 1 && (
                                                    <OptionButton img={OptionIcon} action={!inPopup ? handleOptionPopup : () => setContainerPosition(2)} />
                                                )}
                                            </div>

                                            <FabricSetItemType
                                                types={item?.mono_fabric_type ? item?.mono_fabric_type.split("") : types}
                                                setMonoFabricType={onSelectMonoFabricType}
                                                isChangeble={types?.length > 1}
                                                setContainerPosition={setContainerPosition}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {!isDesktop && (
                            <div className={styles.optionRow}>
                                <FabricSetItemOptions
                                    item={item}
                                    chosenOptions={chosenOptions}
                                    setChosenOptions={setChosenOptions}
                                    componentIndex={componentIndex}
                                    onChangeOptions={onChangeOptions}
                                    isCustom={isCustom}
                                    setContainerPosition={setContainerPosition}
                                />
                                {item?.options?.length > 1 && (
                                    <OptionButton img={OptionIcon} action={!inPopup ? handleOptionPopup : () => setContainerPosition(2)} />
                                )}
                            </div>
                        )}
                    </div>

                    {!inPopup && (
                        <button className={styles.returnButton} onClick={handleReturn}>
                            <img src={ReturnIcon} alt="" />
                        </button>
                    )}
                </div>

                <button
                    onClick={() => handleDeleteComponent(item?.id)}
                    className={styles.hiddenRightBtn}
                    ref={rightHiddenLinkRef}
                    disabled={!isKitSplitted && ("is_custom" in item && !item?.is_custom)}
                >
                    <img src={DeleteSet} alt="" />
                </button>
            </div>

            {showCommentPopup && (
                <GlobalPopup title={"Коментар"} onClose={closeCommentPopup} {...(isDesktop ? { centeredPopup: true } : {})}>
                    <CommentPopup componentIndex={componentIndex} onChangeOptions={onChangeOptions} form={form} close={closeCommentPopup} isCustom={isCustom} />
                </GlobalPopup>
            )}

            {showCustomSizePopup && (
                <GlobalPopup title={"Розмір"} onClose={closeCustomSizePopup} {...(isDesktop ? { centeredPopup: true } : {})}>
                    <CustomSizePopup
                        show={showCustomSizePopup}
                        close={closeCustomSizePopup}
                        onChangeOptions={onChangeOptions}
                        componentIndex={componentIndex}
                        form={form}
                        isCustom={isCustom}
                    />
                </GlobalPopup>
            )}

            {showOptionPopup && (
                <GlobalPopup title={"Опції"} onClose={closeOptionPopup} {...(isDesktop ? { centeredPopup: true } : {})}>
                    <OptionPopup
                        show={showOptionPopup}
                        close={closeOptionPopup}
                        chosenOptions={chosenOptions}
                        setChosenOptions={setChosenOptions}
                        item={item}
                        onChangeOptions={onChangeOptions}
                        componentIndex={componentIndex}
                        form={form}
                        isCustom={isCustom}
                    />
                </GlobalPopup>
            )}
        </div>
    );
};

export default FabricSetItem;