import React, { useState } from "react";
import styles from './FabricChooserList.module.scss';
import FabricChooserSmall from "./FabricChoose";
import arrow from '../../../../assets/icons/arrowDown.svg';
import GlobalPopup from "../../../Common/GlobalPopup/GlobalPopup";
import {useAppDispatch} from "../../../../hooks/redux";
import {setIsActivePopup} from "../../../../store/main-slice";
import ChoosePopup from "./ChoosePopup/ChoosePopup";
import RemoveFiltersIcon from "../../../../assets/icons/filter-remove-icon.svg";
import {useIsDesktop} from "../../../../hooks/useIsDesktop";


const FabricChooserList = ({fabricFilters, handleChange, selectedFabric, title = 'Типи тканин:', isNested = false, removeFilters, type}) => {
    const dispatch = useAppDispatch();
    const [isChooserPopup, setIsChooserPopup] = useState(false);
    const isDesktop = useIsDesktop();
    

    const smallList = fabricFilters && fabricFilters.length > 4
        ? [fabricFilters[0], fabricFilters[1], fabricFilters[2], fabricFilters[3]]
        : null

    const handleOpenChooserPopup = () => {
        setIsChooserPopup(true);
        dispatch(setIsActivePopup(true));
    }

    return (
        <>
            {smallList ? (
                    <ul className={styles.fabricChooser}>
                        {
                            smallList.map((item, index) => (
                                <FabricChooserSmall selectedFabric={selectedFabric} handleChange={handleChange} key={index}
                                                    item={item}/>
                            ))
                        }
                        <button className={styles.fabricChooser__else} onClick={handleOpenChooserPopup}>
                            <img src={arrow} alt=""/>
                        </button>
                        <button className={styles.fabricChooser__removeFilters} onClick={removeFilters}>
                            <img src={RemoveFiltersIcon} alt=""/>
                        </button>
                    </ul>
                ) : (
                    <ul className={styles.fabricChooser}>
                        {fabricFilters.map((item, index) => (
                            <FabricChooserSmall selectedFabric={selectedFabric} handleChange={handleChange} key={index}
                                                item={item}/>
                        ))}
                        <button className={styles.fabricChooser__removeFilters} onClick={removeFilters}>
                            <img src={RemoveFiltersIcon} alt=""/>
                        </button>
                    </ul>

                )
            }
            {isChooserPopup && (
                <GlobalPopup   {...(isDesktop ? { centeredPopup: true } : { topPopup: true })} title={title} onClose={() => setIsChooserPopup(false)} isNested={isNested}>
                    <ChoosePopup selectedFabric={selectedFabric} fabricFilters={fabricFilters} handleChange={handleChange} type={type} />
                </GlobalPopup>
            )}
        </>
    )
}

export default FabricChooserList;