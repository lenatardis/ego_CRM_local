import React, {useState} from "react";
import styles from '../FabricsContent.module.scss';
import {CopyToClipboard} from "react-copy-to-clipboard";
import copyIcon from "../../../../../assets/icons/copy.svg";
import {getBaseUrl} from "../../../../../store/selectors";
import ImgPlaceholder from '../../../../../assets/img/FabricImgPlaceholder.png';
import ImagePopup from "../../../../Common/ImagePopup/ImagePopup";

const FabricItem = ({item, selectedFabricId, onFabricSelect, isCalculator}) => {
    const baseUrl = getBaseUrl;
    const [imagePopup, setImagePopup] = useState(null);

    const showImagePopup = (e,imgURL) => {
        e.stopPropagation();
        setImagePopup(imgURL);
    }

    const closeImagePopup = () => {
        setImagePopup(null);
    }

    return (
        <>
            <li className={item.id === selectedFabricId ? `${styles.chosenFabric} ${styles.fabric}` : styles.fabric}
                onClick={isCalculator ? () => {
                    onFabricSelect(item)
                } : null}>
                <div className={styles.fabric__left}>
                    <div className={styles.fabric__image}>
                        <img className={item.images[0] ? styles.clickable : null} src={item.images[0] ? item.images[0] : ImgPlaceholder} onClick={item?.images[0] ? (e) => showImagePopup(e, item?.images[0]) : null} alt=""/>
                    </div>
                    <div className={styles.fabric__info}>
                        <h5>{item.type?.type || 'Невідомий тип тканини'}</h5>
                        <p>{item.name}</p>
                        <span className={styles.fabric__remainder}>Залишок <span
                            className={item?.total_length <= 10 ? styles.red : null}>{`(${item?.total_length}м)`}</span>,
                                    </span>
                    </div>
                </div>
                {isCalculator
                    ? <div className={styles.fabric__rightCalculator}>
                        <div
                            className={item?.mono_fabric_type.includes('A') ? styles.blockAActive : styles.blockA}>
                            <p>
                                <span>A</span>
                            </p>
                        </div>
                        <div
                            className={item?.mono_fabric_type.includes('B') ? styles.blockBActive : styles.blockB}>
                            <p>
                                <span>B</span>
                            </p>
                        </div>
                    </div>
                    : <div className={styles.fabric__right}>
                        <div className={styles.fabric__category}>
                            {item.mono_fabric_type && (
                                item.mono_fabric_type.map((element, index) => (
                                    <span key={index}>{element}</span>
                                ))
                            )}
                        </div>
                        <CopyToClipboard text={`${baseUrl}/product/?id=${item.id}`} className="click-effect">
                            <button tabIndex={0}>
                                <img src={copyIcon} alt=""/>
                            </button>
                        </CopyToClipboard>
                    </div>
                }
            </li>
            {
                imagePopup && <ImagePopup img={imagePopup} onClose={closeImagePopup}  isShowImagePopup={!!imagePopup}/>
            }
        </>

    )
}

export default React.memo(FabricItem);