import React, {useEffect, useRef} from "react";
import searchIcon from "../../../assets/icons/search.svg";
import styles from './Search.module.scss';

const Search = ({ searchValue, setSearchValue, onSearch }) => {
    const timeout = useRef(null);

    useEffect(() => {
        if (searchValue !== null) {
            clearTimeout(timeout.current);
    
            timeout.current = setTimeout(() => {
                onSearch()
            }, 500);
            return () => {
                clearTimeout(timeout.current);
            };
        }
    }, [searchValue]);

    return (
        <div className={styles.fabrics__search}>
            <input type="search" placeholder={'Пошук'} className={'baseInput'} value={searchValue || ''}
                   onChange={(e) => setSearchValue(e.target.value)}/>
            <img src={searchIcon} alt=""/>
        </div>
    )
}

export default Search;