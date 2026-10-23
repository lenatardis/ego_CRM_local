import React, {useEffect, useRef, useState} from "react";
import styles from "./UkrPoshtaRegion.module.scss";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import '../DeliveryUKR.scss';
import { getCities } from "../../../../api/novaPoshtaApi";
import { getAccessToken } from "../../../../utils/authTokens";


const UkrPoshtaRegion = ({region, setRegion}) => {
    const [regions, setRegions] = useState([]);
    const [value, setValue] = useState('');

    const timeout = useRef();

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
                        setRegions(changerArray)
                    }
                })
            }, 500);
            return () => {
                clearTimeout(timeout.current);
            };
        }
    }, [value]);


    return (
        <div className={styles.ukrPoshtaRegion}>
            <span className="coloredLabel colored--region"></span>
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
                options={regions}
                value={region}
                noOptionsText="No regions"
                onKeyUp={(e) => setValue(e.target.value)}
                onChange={(event, newValue) => setRegion(newValue)}
                renderInput={(params) => <TextField {...params} label="Область або регіон" />}
            />
        </div>
    )
}

export default UkrPoshtaRegion;