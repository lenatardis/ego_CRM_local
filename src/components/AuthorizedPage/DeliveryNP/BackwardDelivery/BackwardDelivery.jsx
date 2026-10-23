import styles from './backward-delivery.module.scss';

export const BackwardDelivery = ({ withBackwardDelivery, onChange }) => {
    return (
        <label className={`baseInput ${styles.backwardDelivery}`}>
            <p>Зворотня доставка</p>
            <input type="checkbox" checked={withBackwardDelivery} onChange={() => onChange(!withBackwardDelivery)} />
            <span></span>
        </label>
    )
}
