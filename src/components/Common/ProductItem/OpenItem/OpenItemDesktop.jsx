import React from "react";
import FabricSlider from "../../../UserPage/FabricSlider";
import ImgPlaceholderIcon from "../../../../assets/icons/placeholderIcon.svg";
import { useLocation, useNavigate } from "react-router-dom";
import { useCopyImage } from "../../../../hooks/useCopyImage";
import copyIcon from "../../../../assets/icons/copy4.svg";
import IconWarning from "../../../../assets/img/warning.svg";
import removeIcon from "../../../../assets/icons/removeIcon.svg";
import pencilIcon from "../../../../assets/icons/pencil.svg";
import styles from '../ProductItem.module.scss';
import { useRef, useEffect, useState } from "react";
import ImagePopup from "../../ImagePopup/ImagePopup";
import InfoHint from "../InfoHint/InfoHint"

const OpenItemDesktop = ({ product, onDelete, isClient, isDisabled = false, sourceName, originalSourceName }) => {
    const navigate = useNavigate();
    const imgUrl = product?.images?.[0]
    const { isImageCopying, copyImageToClipboard } = useCopyImage(imgUrl);
    const { pathname } = useLocation();
    const orderId = pathname.match(/\/[^/]+\/(\d+)/)?.[1] ?? '';

    let commentTempFlag = product?.kitComment || product?.warehouseComment;
    const mainColumnRef = useRef(null);
    const inputRowRef = useRef(null);
    const commentTitleRef = useRef(null);
    const commentContentRef = useRef(null);

    const [commentContentHeight, setCommentContentHeight] = useState('auto');
    const [imagePopup, setImagePopup] = useState(null);

    const showSingleColumn =
        (!product?.components && !commentTempFlag) ||
        (product?.components && !commentTempFlag && !product?.manufacturing?.id && !product?.manufacturing?.status);

    const showImagePopup = (imgURL) => {
        setImagePopup(imgURL);
    }

 const hintText = !isClient
    ? sourceName && originalSourceName && sourceName !== originalSourceName
        ? `Ціну цього товару було взято зі списку "${originalSourceName}", хоча в самому замовленні джерело було змінено на "${sourceName}"`
        : sourceName
            ? `Ціну було взято зі списку "${sourceName}"`
            : "Ціну було взято зі стандартного списку цін"
    : "";


    const closeImagePopup = () => {
        setImagePopup(null);
    }

    useEffect(() => {
        if (!mainColumnRef.current || !commentTitleRef.current || !commentContentRef.current) return;

        const children = Array.from(mainColumnRef.current.children);

        const totalContentHeight = children.reduce((acc, child) => {
            if (child === inputRowRef.current || child.contains(commentTitleRef.current)) {
                return acc;
            }

            const style = window.getComputedStyle(child);
            const marginBottom = parseFloat(style.marginBottom) || 0;
            const height = child.getBoundingClientRect().height;

            return acc + height + marginBottom;
        }, 0);

        const titleHeight = commentTitleRef.current.getBoundingClientRect().height;

        let inputRowHeight = 0;
        if (inputRowRef.current) {
            const inputStyle = window.getComputedStyle(inputRowRef.current);
            const marginBottom = parseFloat(inputStyle.marginBottom) || 0;
            inputRowHeight = inputRowRef.current.getBoundingClientRect().height + marginBottom;
        }

        const availableHeight = totalContentHeight - titleHeight - inputRowHeight;

        setCommentContentHeight(`${availableHeight}px`);
    }, [product]);


    return (
        <>
            <div className={styles.openItem}>
                <div>
                    {product?.images?.length > 1 ? <FabricSlider images={product.images} products /> :
                        <div className={styles.imgPlaceholder}>
                            <div className={styles.darkerImg}></div>
                            <img
                                src={product.images?.length && product.images[0] ? product.images[0] : ImgPlaceholderIcon}
                                className={!product.images?.length || !product.images[0] ? styles.placeholderImg : styles.mainImg}
                                onClick={product?.images?.length && product?.images[0] ? () => showImagePopup(product.images[0]) : null}
                                alt="" />
                            {imgUrl && (
                                <button
                                    onClick={copyImageToClipboard}
                                    style={isImageCopying ? { pointerEvents: 'none' } : null}
                                    className={`${styles.copyButton} click-effect`}
                                    tabIndex={0}
                                >
                                    <img src={copyIcon} alt="" />
                                </button>
                            )}
                        </div>
                    }
                </div>
                <div className={`${styles.innerGrid} ${showSingleColumn ? styles.singleColumn : ''}`}>
                    <div className={styles.mainColumn} ref={mainColumnRef}>
                        {product.components ? (
                            <>
                                <div
                                    className={product.images?.length > 1 ? `${styles.inputRow} ${styles.withSlider}` : styles.inputRow}>
                                    <div className={styles.formGroup}>
                                        <label htmlFor="product_input1">Код тканини</label>
                                        <div className={styles.inputWrap}>
                                            <input type="text" id="product_input1" value={product.fabric_type}
                                                readOnly />
                                        </div>
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label htmlFor="product_input2">Тип комплекту</label>
                                        <input type="text" id="product_input2" value={product.kit_type} readOnly />
                                    </div>
                                </div>
                                {product.components.length > 0 && (
                                    <div className={styles.productInfo}>
                                        <p className={styles.title}>Склад комплекту</p>
                                        <ul className={styles.content}>
                                            {product.components.map((el, idx) => (
                                                <li key={idx} className={styles.value}>{el.name}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                {product.options.length > 0 && (
                                    <div className={styles.productInfo}>
                                        <p className={styles.title}>Додаткові опції:</p>
                                        <ul className={styles.content}>
                                            {product.options.map((el, idx) => (
                                                <li key={idx} className={styles.value}>{el.name}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </>
                        ) : (
                            <>
                                <div
                                    className={product.images?.length > 1 ? `${styles.inputRow} ${styles.withSlider}` : styles.inputRow}>
                                    <div className={styles.formGroup}>
                                        <label htmlFor="product_input1">Назва</label>
                                        <div className={styles.inputWrap}>
                                            <input type="text" id="product_input1" value={product.name} readOnly />
                                            {!product.quantity && <img src={IconWarning} alt="" />}
                                        </div>
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label htmlFor="product_input2">Тип</label>
                                        <input type="text" id="product_input2" value="Товар зі складу" readOnly />
                                    </div>
                                </div>
                                {!product.quantity && <p className={styles.warning}>Тканини немає в наявності</p>}
                                {product.size && <div className={styles.productInfo}>
                                    <label>Розмір</label>
                                    <textarea readOnly value={product.size}></textarea>
                                </div>}
                                {product.color && <div className={styles.productInfo}>
                                    <label htmlFor="product_options">Колір</label>
                                    <input type="text" id="product_options" value={product.color} readOnly />
                                </div>}
                            </>
                        )}
                    </div>
                    <div>
                        {product.components && (product?.manufacturing?.id || product?.manufacturing?.status) && (<>
                            <div className={styles.inputRow}
                                ref={(product?.manufacturing?.id || product?.manufacturing?.status) ? inputRowRef : null}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="manufactiring_id">ID на виробництві</label>
                                    <div className={styles.inputWrap}>
                                        <input type="text" id="manufactiring_id" value={product?.manufacturing?.id}
                                            readOnly />
                                    </div>
                                </div>
                                <div className={styles.formGroup}>
                                    <label htmlFor="manufacturing_status">Статус виробництва</label>
                                    <input type="text" id="manufacturing_status" className={styles.manufacturingStatus}
                                        value={product?.manufacturing?.status} readOnly />
                                </div>
                            </div>
                        </>)}
                        {commentTempFlag && <div className={styles.productInfo}>
                            <p className={styles.title} ref={commentTitleRef}>Коментар</p>
                            <ul className={styles.content} ref={commentContentRef}
                                style={{ height: commentContentHeight, overflow: 'auto' }}>
                                <p>{product?.kitComment || product?.warehouseComment}</p>
                            </ul>
                        </div>}
                    </div>
                </div>
                <div className={styles.btnColumn}>
                    {product.components ? (
                        <>
                            {(product.price || product.price === 0) && (
                                <span className={styles.price}>{product.price} грн</span>
                            )}

                            {!isClient && (
                                <div className={styles.changeRow}>
                                    <button className={styles.changeBtn} onClick={() => onDelete(product.id)}
                                        disabled={isDisabled}>
                                        <img src={removeIcon} alt="Remove" />
                                        <span>Видалити комплект</span>
                                    </button>
                                    <button className={styles.changeBtn}
                                        onClick={() => navigate(`/calculator/${orderId}/${product.id}`)}
                                        disabled={isDisabled}>
                                        <img src={pencilIcon} alt="Edit" />
                                        <span>Змінити комплект</span>
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            {(product.price || product.price === 0) && (
                                <div className={styles.priceRow}>
                                    <span className={styles.price}>{product.price} грн</span>
                                        {!isClient && <InfoHint text={hintText} />}
                                </div>

                            )}
                            {!isClient && (
                                <div className={styles.changeRow}>
                                    <button className={styles.changeBtn} onClick={() => onDelete(product.id)}
                                        disabled={isDisabled}>
                                        <img src={removeIcon} alt="Remove" />
                                        <span>Видалити товар</span>
                                    </button>
                                </div>
                            )}
                        </>
                    )
                    }
                </div>
            </div>
            {
                imagePopup && <ImagePopup img={imagePopup} onClose={closeImagePopup} isShowImagePopup={!!imagePopup} />
            }
        </>
    )
}

export default OpenItemDesktop;