import styles from './backward-delivery.module.scss';
import { t } from '../../../../i18n';

export const BackwardDelivery = ({ withBackwardDelivery, onChange }) => {
    return (
        <label className={`baseInput ${styles.backwardDelivery}`}>
            <p>{t('Зворотня доставка')}</p>
            <input type="checkbox" checked={withBackwardDelivery} onChange={() => onChange(!withBackwardDelivery)} />
            <span></span>
        </label>
    )
}
