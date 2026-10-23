import plusSign from "../../../../../assets/icons/plus.svg";
import styles from "./ComponentsPopup.module.scss";

export default function ComponentsList({ components, onAddComponent, defaultFabricImage = '' }) {
    return (
        <ul className={styles.components__list}>
            {components.map(component => (
                <li key={component.id} className={styles.component}>
                    <div className={styles.component__info}>
                        <div className={styles.component__img}>
                            <img src={component.image[0] || defaultFabricImage} alt="" />
                        </div>
                        <div className={styles.info}>
                            <p className={styles.info__name}>{component.name}</p>
                            <p className={styles.info__price}>{component.price} грн</p>
                        </div>
                    </div>
                    <div className={styles.component__btn}>
                        <button disabled={component.price === 0} className={styles.addBtn} onClick={() => onAddComponent(component)}>
                            <img src={plusSign} alt="" />
                        </button>
                        <span>Додати</span>
                    </div>
                </li>
            ))}
        </ul>
    )
}
