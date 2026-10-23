import React, {useEffect, useState} from "react";
import styles from './CommentPopup.module.scss';
import FabricSetItem from "../../FabricSet/FabricSetItem/FabricSetItem";
import CalcButton from "../../CalcButton/CalcButton";

const CommentPopup = ({componentIndex, onChangeOptions, form, close, newItem, isCustom}) => {
    const [commentText, setCommentText] = useState('');

    const saveComment = () => {
        onChangeOptions(commentText, componentIndex, 'comment', isCustom);
        close();
    }

    useEffect(() => {
        let initialText;
        if (isCustom) {
            initialText = form?.additional_components[componentIndex]?.comment || '';
        } else {
            initialText = form?.template_components[componentIndex]?.comment || '';
        }
        setCommentText(initialText);
    }, [componentIndex]);

    return (
        <div className={styles.popup}>
            {newItem && <FabricSetItem inPopup/>}
            <textarea className={styles.textBlock} name="comment" value={commentText} onChange={(e) => setCommentText(e.target.value)}></textarea>
            <CalcButton action={saveComment} inPopup/>
        </div>
    )
}

export default CommentPopup