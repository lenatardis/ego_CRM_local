import React, { useEffect } from "react";
import styles from './FabricOptions.module.scss';
import imgPlaceholder from "../../../../assets/icons/typePlaceholder.svg";

const FabricOptions = ({options, selectedOptionIds, setSelectedOptionIds, openFabricConsumptionPopup, fabricConsumption}) => {
    const toggleSelectedOption = (optionId) => {
        if (selectedOptionIds.includes(optionId)) {
            const newOptionIds = selectedOptionIds.filter(id => id !== optionId);
            setSelectedOptionIds(newOptionIds);
        } else {
            setSelectedOptionIds(prevOptionIds => ([ ...prevOptionIds, optionId ]));
        }
    }

    useEffect(() => {
        if (options.length > 0 && 'selected' in options[0]) {
            const alreadySelectedOptionIds = options
                .filter(option => option.selected)
                .map(option => option.id);
            setSelectedOptionIds(alreadySelectedOptionIds);
        }
    }, [])

    return (
        <div className={styles.options}>
            <div className={styles.options__row}>
                {options.map((item) => (
                    <label className={styles.options__itemWrap} key={item.id}>
                        <div className={styles.options__placeholder}>
                            {item.image ? (
                                <img src={item.image} alt="" className={styles.options__itemImg}/>
                            ) : (
                                <img src={imgPlaceholder} alt=""/>
                            )}
                        </div>
                        <p>{`${item.name} (${item.price} грн)`}</p>
                        <input
                            type="checkbox"
                            checked={selectedOptionIds.includes(item.id)}
                            onChange={() => toggleSelectedOption(item.id)}
                        />
                    </label>
                ))}
            </div>
            {fabricConsumption !== undefined && (
                <div className={styles.options__fabricAmount}>
                    <span>Витрата тканини:</span>
                    <input
                        type="text"
                        readOnly
                        onClick={openFabricConsumptionPopup}
                        value={fabricConsumption + ' см'}
                    />
                </div>
            )}
        </div>
    )
}

export default FabricOptions