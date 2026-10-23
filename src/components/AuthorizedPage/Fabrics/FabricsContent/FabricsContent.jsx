import React, {useState} from "react";
import styles from './FabricsContent.module.scss';
import {CopyToClipboard} from "react-copy-to-clipboard";
import copyIcon from "../../../../assets/icons/copy.svg";
import {getBaseUrl} from "../../../../store/selectors";
import ImgPlaceholder from '../../../../assets/img/FabricImgPlaceholder.png';
import FabricItem from "./FabricItem/FabricItem";

const FabricsContent = ({fabricsAll, isCalculator = null, totalPages, closeFabricPopup = null, onFabricTypeChange = () => {}}) => {
    const baseUrl = getBaseUrl;
    const [selectedFabricId, setSelectedFabricId] = useState(null);

    const onFabricSelect = (el) => {
        setSelectedFabricId(el.id);
        onFabricTypeChange(el);
        setTimeout(() => {
            closeFabricPopup();
        }, 200);
    }

    return (
        <ul className={isCalculator ? `${styles.fabricsContent} ${styles.fabricsContentPopup}` : `${styles.fabricsContent} ${styles.grid}`}
            style={isCalculator && totalPages <= 1 ? {height: 'calc(100vh - 233px)'} : isCalculator && totalPages > 1 ? {height: 'calc(100vh - 268px)'} : null}>
            {fabricsAll && fabricsAll.length > 0 && (
                fabricsAll.map((item, index) => (
                    <FabricItem item={item} key={index} selectedFabricId={selectedFabricId} onFabricSelect={onFabricSelect} isCalculator={isCalculator}/>
                ))
            )}
        </ul>
    )
}

export default FabricsContent;