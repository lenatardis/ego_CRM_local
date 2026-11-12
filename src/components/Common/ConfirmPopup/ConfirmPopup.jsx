import React, { useEffect } from "react";
import GlobalPopup from "../GlobalPopup/GlobalPopup";
import CancelOrder from "../../AuthorizedPage/Main/Order/Popup/CancelOrder";
import { useAppDispatch } from "../../../hooks/redux";
import { setIsActivePopup } from "../../../store/main-slice";
import { useIsDesktop } from "../../../hooks/useIsDesktop";

// Demo build: a yes / no question before an action that can't be undone (deleting a kit, a product or a kit
// component, splitting a kit) – the app's popup with the order delete confirmation's question and buttons
// (CancelOrder: "Підтвердити" / "Скасувати"); centred on desktop, a bottom sheet on phones.
const ConfirmPopup = ({ title, text, note, onConfirm, onCancel }) => {
    const dispatch = useAppDispatch();
    const isDesktop = useIsDesktop();

    useEffect(() => {
        dispatch(setIsActivePopup(true));
    }, [dispatch]);

    const close = (action) => {
        dispatch(setIsActivePopup(false));
        action();
    };

    return (
        <GlobalPopup title={title} onClose={onCancel} {...(isDesktop ? { centeredPopup: true } : {})}>
            <CancelOrder text={text} note={note} onConfirm={() => close(onConfirm)} onCancel={() => close(onCancel)} />
        </GlobalPopup>
    );
};

export default ConfirmPopup;
