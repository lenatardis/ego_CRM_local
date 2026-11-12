import React from "react";
import styles from './CancelOrder.module.scss';
import Button from './Button/Button';

// `text` (demo build): another question with the same look and buttons, e.g. the suborder create confirmation;
// `note`: a smaller explanation under it (info note)
const CancelOrder = ({onConfirm, onCancel, suborder, ttn, text, note}) => {
    return (
        <div className={styles.cancelOrder}>
            <h2>
                {text ? text : !ttn ? (
                    <>
                        Ви бажаєте<br />
                        видалити {!suborder ? 'замовлення' : 'підзамовлення'}?
                    </>
                ) : (
                    <>Ви дійсно бажаєте роздрукувати ТТН?<br/>Після цього її не можна буде редагувати</>
                )}
            </h2>

            {note && <p className={`${styles.note} infoNote`}>{note}</p>}

            <Button confirm action={onConfirm}/>
            <Button action={onCancel}/>
        </div>
    )
}

export default CancelOrder;