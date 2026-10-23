import React, {useEffect, useRef, useState} from "react";
import styles from "./UkrPoshtaArea.module.scss";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import '../DeliveryUKR.scss';
import { getCities } from "../../../../api/novaPoshtaApi";
import { getAccessToken } from "../../../../utils/authTokens";


const UkrPoshtaArea = ({area, setArea}) => {
    const [areas, setAreas] = useState([]);
    const [value, setValue] = useState('');

    const timeout = useRef(null);

    useEffect(() => {
        if (value.length > 2) {
            clearTimeout(timeout.current);
            const accessToken = getAccessToken();
            timeout.current = setTimeout(() => {
                getCities(accessToken, value).then((response) => {
                    if (response && response.areas) {
                        const changerArray = response.areas.map((item) => {
                            return (
                                {label: item.city, id: item.city_ref, area: item.area, settlement_type: item.settlement_type}
                            )
                        })
                        setAreas(changerArray)
                    }
                })
            }, 500);
            return () => {
                clearTimeout(timeout);
            };
        }
    }, [value]);


    return (
        <div className={styles.ukrPoshtaArea}>
            <span className="coloredLabel colored--are"></span>
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
                options={areas}
                value={area}
                noOptionsText="No districts"
                onKeyUp={(e) => setValue(e.target.value)}
                onChange={(event, newValue) => setArea(newValue)}
                renderInput={(params) => <TextField {...params} label="Район - опціонально" />}
            />
        </div>
    )
}

export default UkrPoshtaArea;