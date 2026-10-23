import React from "react";
import styles from './FabricSize.module.scss';

const FabricSize = ({activeSize, setActiveSize, kitTemplateSizes, setKitSize, setCustomTemplateSize, isEdit, onSizeChange}) => {
   
   
    const handleSizeClick = (sizeIndex, size) => {
        if (!isEdit) {
            setActiveSize({ standard: 1, index: sizeIndex });
            setKitSize(size);
            setCustomTemplateSize('');
            onSizeChange();
        } 
    };

    return (
        <div className={styles.size}>
            <div className={styles.size__row}>
                {!isEdit ? Array.isArray(kitTemplateSizes) && kitTemplateSizes.map((el, index) => (
                    <div key={index}
                        className={`${styles.item} ${activeSize.index === index && activeSize.standard ? styles.activeStandard : ""}`}
                         onClick={() => handleSizeClick(index, el)}>
                        <div className={styles.item__panel}>
                            <span>{el.short_name}</span>
                        </div>
                        <p>{el.name}</p>
                    </div>
                )) : Array.isArray(kitTemplateSizes) && kitTemplateSizes.filter(el => el.selected === true).length > 0
                    ? kitTemplateSizes
                        .filter(el => el.selected === true)
                        .map((el, index) => (
                            <div key={index} className={`${styles.item} 
                            ${styles.activeStandard}`}
                                onClick={() => handleSizeClick(index, el)}>
                                <div className={styles.item__panel}>
                                    <span>{el.short_name}</span>
                                </div>
                                <p>{el.name}</p>
                            </div>
                        ))
                    : <p>No selected sizes available</p>
                }
            </div>
        </div>
    )
}

export default FabricSize