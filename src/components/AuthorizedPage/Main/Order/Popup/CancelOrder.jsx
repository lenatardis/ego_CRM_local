import React from "react";
import styles from './CancelOrder.module.scss';
import Button from './Button/Button';

// `text` (demo build): another question with the same look and buttons, e.g. the suborder create confirmation
const CancelOrder = ({onConfirm, onCancel, suborder, ttn, text}) => {
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

            <Button confirm action={onConfirm}/>
            <Button action={onCancel}/>
        </div>
    )
}

export default CancelOrder;