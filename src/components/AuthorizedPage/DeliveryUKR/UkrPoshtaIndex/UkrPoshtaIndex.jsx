import React, {useEffect, useRef, useState} from "react";
import styles from "./UkrPoshtaIndex.module.scss";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import '../DeliveryUKR.scss';
import { getAccessToken } from "../../../../utils/authTokens";
import { getCities } from "../../../../api/novaPoshtaApi";


const UkrPoshtaIndex = ({index, setIndex}) => {
    const [indexes, setIndexes] = useState([]);
    const [value, setValue] = useState('');

    const timeout = useRef(null);

    useEffect(() => {
        if (value.length > 2) {
            clearTimeout(timeout.current);
            const accessToken = getAccessToken();
            timeout.current = setTimeout(() => {
                getCities(accessToken, value).then((response) => {
                    if (response && response.indexes) {
                        const changerArray = response.indexes.map((item) => {
                            return (
                                {label: item.city, id: item.city_ref, area: item.area, settlement_type: item.settlement_type}
                            )
                        })
                        setIndexes(changerArray)
                    }
                })
            }, 500);
            return () => {
                clearTimeout(timeout.current);
            };
        }
    }, [value]);


    return (
        <div className={styles.ukrPoshtaIndex}>
            <span className="coloredLabel colored--index"></span>
            <Autocomplete
                disablePortal
                sx={{
                    "& .MuiInputLabel-root": { fontSize: '12px !important' }
                }}
                ListboxProps={{
                    sx: {
                        fontSize: '12px'
                    }
                }}
                options={indexes}
                value={index}
                noOptionsText="No index"
                onKeyUp={(e) => setValue(e.target.value)}
                onChange={(event, newValue) => setIndex(newValue)}
                renderInput={(params) => <TextField {...params} label="Поштовий індекс *" />}
            />
        </div>
    )
}

export default UkrPoshtaIndex;