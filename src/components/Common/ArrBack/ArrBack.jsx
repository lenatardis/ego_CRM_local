import React from "react";
import styles from './ArrBack.module.scss';
import { useNavigate } from "react-router";
import arrIcon from "../../../assets/icons/arrowRight.svg";

const ArrBack = () => {
  const navigate = useNavigate();

  const onReturn = () => {
    // a page opened directly (e.g. a customer's link) has no app page behind it: go to the start page instead
    if (window.history.state?.idx > 0) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  return (<p className={styles.arrLine}>
    <span className={styles.arrWrap} onClick={() => onReturn()}>
      <img
        src={arrIcon}
        alt=""
        className={styles.arrIcon}
      /><span>Назад</span></span>
  </p>)

}

export default ArrBack;