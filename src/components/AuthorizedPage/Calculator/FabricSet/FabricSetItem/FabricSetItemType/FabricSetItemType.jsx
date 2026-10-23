import React, {useState} from "react";
import styles from '../../FabricSet.module.scss';

const FabricSetItemType = ({types, setMonoFabricType, setContainerPosition, isChangeble}) => {
    const [nextThirdStep, setNextThirdStep] = useState(false);

    const handleCircleClick = () => {
        setContainerPosition(2);
        if (isChangeble) {
            let newType;
            if (types.length === 2 && !nextThirdStep) {
                newType = 'A';
            }
            if (types.length === 1 && types.includes('A')) {
                newType = 'AB';
                setNextThirdStep(true);
            }
            if (types.length === 2 && nextThirdStep) {
                newType = 'B';
                setNextThirdStep(false);
            }
            if (types.length === 1 && types.includes('B')) {
                newType = 'A';
            }
            setMonoFabricType(newType);
        }
    };

    return (
        <div className={styles.circleContainer} onClick={() => handleCircleClick()}>
            <div
                className={`${styles.circle} ${types.length > 0 && types.includes('A') ? styles.active : ""}`}>
                <span>A</span>
            </div>
            <div
                className={`${styles.circle} ${types.length > 0 && types.includes('B') ? styles.active : ""}`}>
                <span>B</span>
            </div>
        </div>
    )
}

export default FabricSetItemType