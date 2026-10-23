import React, { useEffect, useRef, useState } from "react";
import styles from "../DeliveryNP.module.scss";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { getAccessToken } from "../../../../utils/authTokens";
import { getCities } from "../../../../api/novaPoshtaApi";


const NovaPoshtaCities = ({cityValue, setCityValue, updateData, error}) => {
    const [cities, setCities] = useState([]);
    const timeout = useRef(null);

    useEffect(() => {
        if (cityValue.length > 2) {
            clearTimeout(timeout.current);
            timeout.current = setTimeout(() => {
                const accessToken = getAccessToken();
                getCities(accessToken, cityValue).then((response) => {
                    if (response && response.cities) {
                        const changerArray = response.cities.map((item) => {
                            return (
                                { label: item.city, id: item.city_ref, area: item.area, settlement_type: item.settlement_type }
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
    }, [cityValue]);

    return (
        <div className={styles.deliveryNP__select}>
            <span className="coloredLabel colored--city"></span>
            <Autocomplete
                disablePortal
                sx={{
                    "& .MuiInputBase-root": { paddingLeft: '21px !important' },
                    "& .MuiFormLabel-root": { left: '9px !important' },
                }}
                ListboxProps={{
                    sx: {
                        fontSize: '12px'
                    }
                }}
                options={cities}
                value={cityValue}
                className={error ? 'baseInputError' : ''}
                noOptionsText="No cities"
                onKeyUp={(e) => setCityValue(e.target.value)}
                onChange={(event, newValue) => {
                    if (newValue) {
                        const { label: city, id: city_ref } = newValue;
                        setCityValue(city);
                        updateData({
                            city,
                            city_ref,
                            address: null,
                            address_ref: null,
                            max_weight_allowed: null,
                            warehouse_number: null,
                        });
                    }
                }}
                renderInput={(params) => <TextField {...params} label="Місто" />}
            />
        </div>
    )
}

export default NovaPoshtaCities;