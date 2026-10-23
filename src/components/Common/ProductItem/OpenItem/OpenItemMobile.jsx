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

const OpenItemMobile = ({product, onDelete, isClient, isDisabled = false}) => {
    const navigate = useNavigate();
    const imgUrl = product?.images?.[0]
    const { isImageCopying, copyImageToClipboard } = useCopyImage(imgUrl);
    const { pathname } = useLocation();
    const orderId = pathname.match(/\/[^/]+\/(\d+)/)?.[1] ?? '';
    const commentTempFlag = product?.kitComment || product?.warehouseComment;

    return (
        <div className={styles.openItem}>
            <div>
                {product?.images?.length > 1 ? <FabricSlider images={product.images}/> :
                    <div className={styles.imgPlaceholder}>
                        <div className={styles.darkerImg}></div>
                        <img src={product.images?.length && product.images[0] ? product.images[0] : ImgPlaceholderIcon}
                             className={!product.images?.length || !product.images[0] ? styles.placeholderImg : styles.mainImg}
                             alt=""/>
                        {imgUrl && (
                            <button
                                onClick={copyImageToClipboard}
                                style={isImageCopying ? {pointerEvents: 'none'} : null}
                                className={`${styles.copyButton} click-effect`}
                                tabIndex={0}
                            >
                                <img src={copyIcon} alt=""/>
                            </button>
                        )}
                    </div>
                }
            </div>
            <div>
                {product.components ? (
                    <>
                        <div className={product.images?.length > 1 ? `${styles.inputRow} ${styles.withSlider}` : styles.inputRow}>
                            <div className={styles.formGroup}>
                                <label htmlFor="product_input1">Код тканини</label>
                                <div className={styles.inputWrap}>
                                    <input type="text" id="product_input1" value={product.fabric_type} readOnly/>
                                </div>
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="product_input2">Тип комплекту</label>
                                <input type="text" id="product_input2" value={product.kit_type} readOnly/>
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
                        {(product.price || product.price === 0) && <div className={styles.productInfo}>
                            <label htmlFor="product_options">Ціна </label>
                            <input type="text" id="product_options" value={`${product.price} грн`} readOnly/>
                        </div>}
                        <div>
                            {(product?.manufacturing?.id || product?.manufacturing?.status) && (<>
                                <div className={styles.inputRow}>
                                    <div className={styles.formGroup}>
                                        <label htmlFor="manufactiring_id">ID на виробництві</label>
                                        <div className={styles.inputWrap}>
                                            <input type="text" id="manufactiring_id" value={product?.manufacturing?.id} readOnly/>
                                        </div>
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label htmlFor="manufacturing_status">Статус виробництва</label>
                                        <input type="text" id="manufacturing_status" className={styles.manufacturingStatus}
                                               value={product?.manufacturing?.status} readOnly/>
                                    </div>
                                </div>
                            </>)}
                            {commentTempFlag && <div className={styles.productInfo}>
                                <p className={styles.title}>Коментар</p>
                                <ul className={styles.content}>
                                    <p>{product?.kitComment || product?.warehouseComment}</p>
                                </ul>
                            </div>}
                        </div>
                        {!isClient && (
                            <div className={styles.changeRow}>
                                <button className={styles.changeBtn} onClick={() => onDelete(product.id)} disabled={isDisabled}>
                                    <img src={removeIcon} alt="Remove" />
                                    <span>Видалити комплект</span>
                                </button>
                                <button className={styles.changeBtn} onClick={() => navigate(`/calculator/${orderId}/${product.id}`)} disabled={isDisabled}>
                                    <img src={pencilIcon} alt="Edit" />
                                    <span>Змінити комплект</span>
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <>
                        <div className={product.images?.length > 1 ? `${styles.inputRow} ${styles.withSlider}` : styles.inputRow}>
                            <div className={styles.formGroup}>
                                <label htmlFor="product_input1">Назва</label>
                                <div className={styles.inputWrap}>
                                    <input type="text" id="product_input1" value={product.name} readOnly/>
                                    {!product.quantity && <img src={IconWarning} alt=""/>}
                                </div>
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="product_input2">Тип</label>
                                <input type="text" id="product_input2" value="Товар зі складу" readOnly/>
                            </div>
                        </div>
                        {!product.quantity && <p className={styles.warning}>Тканини немає в наявності</p>}
                        {product.size && <div className={styles.productInfo}>
                            <label>Розмір</label>
                            <textarea readOnly value={product.size}></textarea>
                        </div>}
                        {product.color && <div className={styles.productInfo}>
                            <label htmlFor="product_options">Колір</label>
                            <input type="text" id="product_options" value={product.color} readOnly/>
                        </div>}
                        {(product.price || product.price === 0) && <div className={styles.productInfo}>
                            <label htmlFor="product_options">Ціна</label>
                            <input type="text" id="product_options" value={`${product.price} грн`} readOnly/>
                        </div>}
                        {commentTempFlag && <div className={styles.productInfo}>
                            <p className={styles.title}>Коментар</p>
                            <ul className={styles.content}>
                                <p>{product?.kitComment || product?.warehouseComment}</p>
                            </ul>
                        </div>}
                        {!isClient && (
                            <div className={styles.changeRow}>
                                <button className={styles.changeBtn} onClick={() => onDelete(product.id)} disabled={isDisabled}>
                                    <img src={removeIcon} alt="Remove" />
                                    <span>Видалити товар</span>
                                </button>
                            </div>
                        )}
                    </>

                )}
            </div>
        </div>
    )
}

export default OpenItemMobile;