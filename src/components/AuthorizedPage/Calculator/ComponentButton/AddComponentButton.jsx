import styles from "./AddComponentButton.module.scss";
import plusSign from "../../../../assets/icons/plus.svg";
import plusIcon from "../../../../assets/icons/plus.svg";

export default function AddComponentButton({ onClick }) {
    return (
        <button className={styles.componentButton} onClick={onClick}>
            <img className={styles.plus} src={plusIcon} alt="Plus sign" />
            <span>Додати нові компоненти до комплекту</span>
        </button>
    )
}
