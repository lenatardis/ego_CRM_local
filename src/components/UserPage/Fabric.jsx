import React, {useEffect, useState} from "react";
import styles from './Fabric.module.scss';
import ImgPlaceholder from '../../assets/img/FabricImgPlaceholder.png';
import FabricSlider from "./FabricSlider";
import {useLocation} from "react-router";
import queryString from "query-string";
import Preloader from "../Common/Preloader/Preloader";
import { getFabricItem, getProductDetail } from "../../api/productsApi";
import logo from "../../assets/img/logoEgo.svg";

const Fabric = () => {
    const params = useLocation();
    const urlString = params.search;
    const hash = queryString.parse(urlString);
    const [fabric, setFabric] = useState(null);
    const [product, setProduct] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const item = {
        name: fabric?.name ? fabric.name : product?.name ? product.name : 'Невідома назва',
        type: fabric?.type?.type ? fabric.type.type :  product?.type?.type ? product.type.type : 'Невідомий тип',
        images: fabric?.images ? fabric.images : product?.images ? product.images : []
    }

    useEffect(() => {
        if (urlString && hash?.id) {
            getFabricItem(hash.id).then((response) => {
                if (response) {
                    setFabric(response)
                }
            }).finally(() => {
                setIsLoading(false);
            })
        } else if (urlString && hash?.storageId) {
            getProductDetail(hash.storageId).then((result) => {
                if (result) {
                    setProduct(result)
                }
            }).finally(() => {
                setIsLoading(false);
            })
        } else {
            setIsLoading(false);
        }
    }, [urlString, hash?.id, hash?.storageId]);

    if (isLoading) {
        return <Preloader/>
    }

    console.log(item);
    console.log(product);
    console.log(fabric);

    return (
        <div className={styles.fabric}>
            <div className={styles.pageWrap}>
                <div className={styles.fabric__logo}>
                    <img src={logo} alt=""/>
                </div>
                <div className={styles.grid}>
                    <div>
                        {item.images.length > 1 ? <FabricSlider images={item.images} column/> : <div className={styles.imgPlaceholder}>
                            <img src={!item.images.length || !item.images[0] ? ImgPlaceholder : item.images[0]}
                                 className={!item.images.length || !item.images[0] ? '' : styles.mainImg}
                                 alt=""/>
                        </div>}
                    </div>
                    <div className={item.images.length > 1 ? `${styles.tableWrap} ${styles.withSlider}` : styles.tableWrap}>
                        {product && (
                            <>
                                <h3>{item.name}</h3>
                                <div className={`${styles.table} ${styles.productTable}`}>
                                    <div><span>Розмір</span></div>
                                    <div><span>Колір</span></div>
                                    <div><span>Вартість</span></div>
                                    <div><span>Доступно</span></div>
                                    {product.sizes && product.sizes.length > 0 && product.sizes.map((size, idx) => (
                                        <React.Fragment key={idx}>
                                            <div
                                                className={styles.size}
                                                style={{ gridRow: `span ${size.colors.length}`, fontWeight: 500 }}
                                            >
                                                <span>{size['width']}x{size['length']}</span>
                                            </div>
                                            {size.colors && size.colors.length > 0 && size.colors.map((color) => (
                                                <React.Fragment key={color.color_id}>
                                                    <div
                                                        className={styles.color}
                                                        style={{ backgroundColor: color.name }}
                                                    ></div>
                                                    <div className={styles.price}>
                                                        <span>{color.price} грн</span>
                                                    </div>
                                                    <div className={styles.quantity}>
                                                        <span>{color.quantity} шт.</span>
                                                    </div>
                                                </React.Fragment>
                                            ))}
                                            <span className={styles.divider}></span>
                                        </React.Fragment>
                                    ))}
                                </div>
                            </>
                        )}
                        {fabric && (
                            <>
                                <h3>{item.name} {item.type}</h3>
                                <div className={`${styles.table} ${styles.fabricTable}`}>
                                    <div><span>Назва</span></div>
                                    <div><span>Вартість</span></div>
                                    <div><span>Доступно</span></div>
                                    {fabric.available_kit_templates && fabric.available_kit_templates.length > 0 && fabric.available_kit_templates.map((template, idx) => (
                                        <React.Fragment key={idx}>
                                            <div><span>{template.name}</span></div>
                                            <div><span>{template.price} грн</span></div>
                                            <div><span>{template.count} шт.</span></div>
                                        </React.Fragment>
                                    ))}
                                </div>
                                <p>Доступно в компанії</p>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Fabric;