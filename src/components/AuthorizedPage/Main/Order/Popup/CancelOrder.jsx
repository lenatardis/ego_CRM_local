import React from "react";
import styles from './CancelOrder.module.scss';
import Button from './Button/Button';

const CancelOrder = ({onConfirm, onCancel, suborder, ttn}) => {
    return (
        <div className={styles.cancelOrder}>
            <h2>
                {!ttn ? (
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