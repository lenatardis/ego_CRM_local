import React, {useEffect, useRef, useState} from "react";
import styles from '../../FabricSet/FabricSet.module.scss';
import GlobalCalculator from "../../../../Common/GlobalCalculator/GlobalCalculator";

const CustomSizePopup = ({close, onChangeOptions, componentIndex, form, isCustom}) => {
    const [width, setWidth] = useState('');
    const [length, setLength] = useState('');
    const [currentFocus, setCurrentFocus] = useState('width');
    const [lastEditedInput, setLastEditedInput] = useState('');
    const widthInputRef = useRef(null);
    const lengthInputRef = useRef(null);

    const onCustomSizeSave = () => {
        onChangeOptions(`${width}x${length}`, componentIndex, 'custom_size', isCustom);
        close();
    }

    const handleWidthChange = (e) => {
        let value = e.target.textContent;
        let potentialNewValue = width + value;
        if (width === '0') {
            potentialNewValue = value;
        }
        if (potentialNewValue.length <= 3 && /^\d{1,3}$/.test(potentialNewValue)) {
            let numericValue = parseInt(potentialNewValue, 10);
            if (numericValue <= 999) {
                setWidth(potentialNewValue);
                setLastEditedInput('width');
                if (potentialNewValue.length === 3 || numericValue === 0) {
                    lengthInputRef.current.focus();
                }
            }
        }
    }

    const handleWidthDelete = () => {
        let newValue = width.slice(0, width.length - 1);
        setWidth(newValue);
    }

    const handleLengthChange = (e) => {
        let value = e.target.textContent;
        let potentialNewValue = length + value;
        if (potentialNewValue.length <= 3 && /^\d{1,3}$/.test(potentialNewValue)) {
            let numericValue = parseInt(potentialNewValue, 10);
            if (numericValue <= 999) {
                setLength(potentialNewValue);
                setLastEditedInput('length');
            }
        }
    }

    const handleLengthDelete = () => {
        let newValue = length.slice(0, length.length - 1);
        setLength(newValue);
    }

    const handleCustomSizeChange = (e) => {
        if ((currentFocus === 'width' && width.length !== 3) || (!currentFocus && width.length !== 3)) {
            handleWidthChange(e)
        } else if (currentFocus === 'length' || (!currentFocus && width.length === 3) || (currentFocus === 'width' && width.length === 3)) {
            handleLengthChange(e);
        }
    }

    const handleCustomSizeDelete = () => {
        if (currentFocus === 'width' || (currentFocus === 'length' && length.length === 0)) {
            handleWidthDelete();
            widthInputRef.current.focus();
        } else if (currentFocus === 'length' && length.length !== 0) {
            handleLengthDelete();
        } else if (!currentFocus) {
            if (lastEditedInput === 'width') {
                handleWidthDelete();
            } else if (lastEditedInput === 'length' && length.length !== 0) {
                handleLengthDelete();
            } else if (lastEditedInput === 'length' && length.length === 0) {
                handleWidthDelete();
            }
        }
    }

    useEffect(() => {
        const key = isCustom ? 'additional_components' : 'template_components';
        const initialCustomSize = form[key][componentIndex]?.custom_size;
        if (initialCustomSize) {
            const initialWidth = initialCustomSize.split('x')[0];
            setWidth(initialWidth);
            const initialLength = initialCustomSize.split('x')[1];
            setLength(initialLength);
            setCurrentFocus('length');
            setLastEditedInput('length');
        }
    }, [componentIndex]);

    return (
        <GlobalCalculator handleChange={handleCustomSizeChange} handleDelete={handleCustomSizeDelete}
                            onSubmit={() => onCustomSizeSave()}>
            <div className={styles.sizeInputWrap}>
                <input
                    value={width.padStart(1, '0')}
                    className={`baseInput ${currentFocus === 'width' ? styles.focus : ''}`}
                    readOnly
                    onFocus={() => setCurrentFocus('width')}
                    ref={widthInputRef}/>
                <span>x</span>
                <input
                    value={length.padStart(1, '0')}
                    className={`baseInput ${currentFocus === 'length' ? styles.focus : ''}`}
                    readOnly
                    onFocus={() => setCurrentFocus('length')}
                    ref={lengthInputRef}/>
            </div>
        </GlobalCalculator>
    )
}

export default CustomSizePopup