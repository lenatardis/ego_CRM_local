import styles from "./AddCommentButton.module.scss";
import plusIcon from "../../../../assets/icons/plus.svg";
import commentIcon from "../../../../assets/icons/comment-white.svg";
import { t } from '../../../../i18n';

export default function AddCommentButton({ onClick }) {
  return (
    <button className={styles.addCommentBtn} onClick={onClick}>
      <img className={styles.plus} src={plusIcon} alt="Plus sign" />
      <span>{t('Додати коментар до комплекту')}</span>
      <img className={styles.comment} src={commentIcon} alt="Comment sign" />
    </button>
  )
}
