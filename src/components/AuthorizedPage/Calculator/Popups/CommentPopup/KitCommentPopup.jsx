import CalcButton from '../../CalcButton/CalcButton';
import styles from './KitCommentPopup.module.scss';

export default function KitCommentPopup({ kitCommentText, setKitCommentText, onSaveKitComment }) {
    return (
        <div className={styles.popup}>
            <div className={styles.textareaBlock}>
                <textarea className={styles.textarea} onChange={(e) => setKitCommentText(e.target.value)} value={kitCommentText}></textarea>
            </div>
            <CalcButton action={onSaveKitComment} inPopup/>
        </div>
    )
}
