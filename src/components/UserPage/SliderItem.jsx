import { useCopyImage } from "../../hooks/useCopyImage";
import copyIcon from "../../assets/icons/copy4.svg";
import styles from "./FabricSlider.module.scss";

export default function SliderItem({ imgUrl }) {
    const { isImageCopying, copyImageToClipboard } = useCopyImage(imgUrl);

    return (
        <div className={styles.sliderItem}>
            <img className={styles.sliderImg} src={imgUrl} alt=""/>
            <button
                className={`${styles.copyButton} click-effect`}
                style={isImageCopying ? {pointerEvents: 'none'} : null}
                onClick={copyImageToClipboard}
                tabIndex={0}
            >
                <img src={copyIcon} alt=""/>
            </button>
        </div>
    )
}