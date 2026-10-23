import { useEffect, useState } from "react";
import { Pagination } from "@mui/material";
import Preloader from "../../../../Common/Preloader/Preloader";
import styles from "./ComponentsPopup.module.scss";
import ComponentsFilters from "./ComponentsFilters";
import ComponentsList from "./ComponentsList";
import { getAccessToken } from "../../../../../utils/authTokens";
import { getKitCustomComponents } from "../../../../../api/calculatorApi";
import Search from "../../../../Common/Search/Search";

export default function ComponentPopup({ addCustomComponent, defaultFabricImage, fabricId, sourceID }) {
    const [searchValue, setSearchValue] = useState(null);
    const [selectedFiltersIds, setSelectedFiltersIds] = useState([]);
    const [selectedFilters, setSelectedFilters] = useState([]);
    const [allFilters, setAllFilters] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [components, setComponents] = useState([]);

    useEffect(() => {
        if (!allFilters.length) {
            const accessToken = getAccessToken();
            setIsLoading(true);
            const params = {
                page: page,
                fabric_id: fabricId,
                source_id: sourceID
            }
            getKitCustomComponents(accessToken, params).then((response) => {
                if (response?.custom_components && response.custom_components.length > 0) {
                    setComponents(response.custom_components);
                }
                if (response?.total_pages) {
                    setTotalPages(response.total_pages)
                }
                if (response?.component_types) {
                    setAllFilters(response.component_types);
                }
                setIsLoading(false);
            }).finally(() => {
                setIsLoading(false);
            })
        }
    }, []);

    const handlePaginationChange = (event, value) => {
        if (page !== value) {
            setPage(value);
            window.scrollTo({top: 0, behavior: 'auto'});
            const accessToken = getAccessToken();
            setIsLoading(true);
            // if (filter && filter.length > 0 && searchValue?.length > 0) {
            //     getFabrics(token, value, filter, searchValue).then((response) => {
            //         if (response?.fabrics) {
            //             dispatch(setFabricsList(response.fabrics));
            //             dispatch(setIsLoading(false));
            //         }
            //         if (response?.total_pages) {
            //             setTotalPages(response.total_pages)
            //         }
            //     }).catch(err => {
            //         console.error("Error fetching fabrics on page change: ", err);
            //         dispatch(setIsLoading(false));
            //     })
            // } else if (filter && filter.length > 0 && searchValue?.length === 0) {
            //     getFabrics(token, value, filter).then((response) => {
            //         if (response?.fabrics) {
            //             dispatch(setFabricsList(response.fabrics));
            //             dispatch(setIsLoading(false));
            //         }
            //         if (response?.total_pages) {
            //             setTotalPages(response.total_pages)
            //         }
            //     }).catch(err => {
            //         console.error("Error fetching fabrics on page change: ", err);
            //         dispatch(setIsLoading(false));
            //     })
            // } else {
            //     getFabrics(token, value).then((response) => {
            //         if (response?.fabrics) {
            //             dispatch(setFabricsList(response.fabrics));
            //             dispatch(setIsLoading(false));
            //         }
            //         if (response?.total_pages) {
            //             setTotalPages(response.total_pages)
            //         }
            //     }).catch(err => {
            //         console.error("Error fetching fabrics on page change: ", err);
            //         dispatch(setIsLoading(false));
            //     })
            // }
        }
    };

    const onSendFilters = (filterIds) => {
        setIsLoading(true);
        const accessToken = getAccessToken();
        const params = {
            page: page,
            search: searchValue,
            fabric_id: fabricId,
            component_type: filterIds,
            source_id: sourceID
        };
        getKitCustomComponents(accessToken, params).then((response) => {
            if (response?.custom_components) {
                setComponents(response.custom_components);
            }
            if (response?.total_pages) {
                setTotalPages(response.total_pages)
            }
        }).catch(err => {
            console.error("Error fetching fabrics on page change: ", err);
        }).finally(() => setIsLoading(false));
    }

    const handleSelectFilter = (value) => {
        if (selectedFilters.length) {
            setComponents([]);
            const isItemValue = selectedFilters.find((item) => item === value);
            if (isItemValue) {
                const newArray = selectedFilters.filter((item) => item !== value);
                const newFilters = selectedFiltersIds.filter((item) => item !== value.id);
                setSelectedFilters([...newArray]);
                setSelectedFiltersIds([...newFilters]);
                onSendFilters([...newFilters])

            } else {
                setSelectedFilters([...selectedFilters, value]);
                setSelectedFiltersIds([...selectedFiltersIds, value.id]);
                onSendFilters([...selectedFiltersIds, value.id]);
            }
        } else {
            const newArray = [value];
            setSelectedFilters(newArray);
            setSelectedFiltersIds([value.id]);
            onSendFilters([value.id]);
        }
    }

    return (
        <div className={styles.components}>
            <Search searchValue={searchValue} setSearchValue={setSearchValue} onSearch={() => onSendFilters(selectedFiltersIds)} />
            {allFilters?.length > 0 && (
                <ComponentsFilters
                    allFilters={allFilters}
                    selectedFilters={selectedFilters}
                    handleSelectFilter={handleSelectFilter}
                />
            )}
            {Array.isArray(components) && components.length > 0 && (
                <ComponentsList components={components} onAddComponent={addCustomComponent} defaultFabricImage={defaultFabricImage} />
            )}
            {totalPages > 1 && (
                <Pagination count={totalPages} page={page} siblingCount={1} boundaryCount={1} hidePrevButton hideNextButton onChange={handlePaginationChange} />
            )}
            {isLoading && (
                <Preloader />
            )}
        </div>
    )
}
