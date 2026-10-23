import React, {useEffect, useState} from "react";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { CircularProgress } from "@mui/material";
import { useDebouncedValue } from "../../../../hooks/useDebouncedValue";
import { getAccessToken } from "../../../../utils/authTokens";
import { getDepartment } from "../../../../api/novaPoshtaApi";

const NovaPoshtaDepartments = ({cityId, department, updateData, error}) => {
    const [departments, setDepartments] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [loading, setLoading] = useState(false);
    const debouncedSearchText = useDebouncedValue(searchText, 500);

    useEffect(() => {
        if (cityId) {
            const accessToken = getAccessToken();
            setLoading(true);
            getDepartment(accessToken, cityId, debouncedSearchText).then((response) => {
                if (response && response.warehouses) {
                    const { warehouses } = response;
                    if (Array.isArray(warehouses)) {
                        const changerArray = warehouses.map((item) => {
                            return (
                                {
                                    label: item.address,
                                    address_ref: item.address_ref,
                                    city: item.city,
                                    city_ref: item.city_ref,
                                    index: item.index,
                                    max_weight_allowed: item.max_weight_allowed,
                                    max_weight_allowed_place: item.max_weight_allowed_place,
                                    max_weight_allowed_total: item.max_weight_allowed_total,
                                    number: item.number
                                }
                            )
                        })
                        setDepartments(changerArray)
                    } else {
                        const changerObject = {
                            label: warehouses.address,
                            address_ref: warehouses.address_ref,
                            city: warehouses.city,
                            city_ref: warehouses.city_ref,
                            index: warehouses.index,
                            max_weight_allowed: warehouses.max_weight_allowed,
                            max_weight_allowed_place: warehouses.max_weight_allowed_place,
                            max_weight_allowed_total: warehouses.max_weight_allowed_total,
                            number: warehouses.number
                        }
                        setDepartments([changerObject])
                    }
                }
            }).finally(() => setLoading(false))
        }
    }, [cityId, debouncedSearchText])

    return (
        <>
            <Autocomplete
                disablePortal
                options={departments}
                ListboxProps={{
                    sx: {
                        fontSize: '12px'
                    }
                }}
                value={department}
                className={error ? 'baseInputError' : ''}
                noOptionsText="No warehouses"
                onChange={(event, newValue) => {
                    if (newValue && newValue.label) {
                        updateData({
                            address: newValue.label,
                            address_ref: newValue.address_ref,
                            max_weight_allowed: newValue.max_weight_allowed,
                            warehouse_number: newValue.number,
                        });
                    }
                }}
                onInputChange={(e, newSearchValue) => setSearchText(newSearchValue)}
                loading={loading}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        label="Номер відділення"
                        slotProps={{
                            input: {
                              ...params.InputProps,
                              endAdornment: (
                                <React.Fragment>
                                  {loading ? <CircularProgress color="inherit" size={20} /> : null}
                                  {params.InputProps.endAdornment}
                                </React.Fragment>
                              ),
                            },
                        }}
                    />
                )}
            />
        </>
    )
}

export default NovaPoshtaDepartments;