import styles from './not-found.module.scss';
import { useAppDispatch } from "../../../hooks/redux";
import { setIsNotFound } from '../../../store/main-slice';
import { useNavigate } from 'react-router-dom';

export default function NotFound({ message }) {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const handleNavigate = () => {
        dispatch(setIsNotFound(false));
        navigate('/');
    }

    return (
        <div className={styles.notFound}>
            <h2 className={styles.message}>{message}</h2>
            <button onClick={handleNavigate} className={styles.link}>
                <span>На головну</span>
            </button>
        </div>
    )
}
