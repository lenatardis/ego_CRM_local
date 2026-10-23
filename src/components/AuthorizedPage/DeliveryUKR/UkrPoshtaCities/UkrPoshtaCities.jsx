import React, {useEffect, useRef, useState} from "react";
import styles from "./UkrPoshtaCities.module.scss";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import '../DeliveryUKR.scss';
import { getAccessToken } from "../../../../utils/authTokens";
import { getCities } from "../../../../api/novaPoshtaApi";


const UkrPoshtaCities = ({city, setCity}) => {
    const [cities, setCities] = useState([]);
    const [value, setValue] = useState('');

    const timeout = useRef(null);

    useEffect(() => {
        if (value.length > 2) {
            clearTimeout(timeout.current);
            const accessToken = getAccessToken();
            timeout.current = setTimeout(() => {
                getCities(accessToken, value).then((response) => {
                    if (response && response.cities) {
                        const changerArray = response.cities.map((item) => {
                            return (
                                {label: item.city, id: item.city_ref, area: item.area, settlement_type: item.settlement_type}
                            )
                        })
                        setCities(changerArray)
                    }
                })
            }, 500);
            return () => {
                clearTimeout(timeout.current);
            };
        }
    }, [value]);


    return (
        <div className={styles.ukrPoshtaCities}>
            <span className="coloredLabel colored--city"></span>
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
                options={cities}
                value={city}
                noOptionsText="No cities"
                onKeyUp={(e) => setValue(e.target.value)}
                onChange={(event, newValue) => setCity(newValue)}
                renderInput={(params) => <TextField {...params} label="Місто або населений пункт" />}
            />
        </div>
    )
}

export default UkrPoshtaCities;