import React, {useEffect, useState} from "react";
import styles from './FabricType.module.scss';
import FabricTypeFabrics from "./FabricTypeFabrics/FabricTypeFabrics";
import FabricArticles from "./FabricArticles/FabricArticles";
import { useNavigate } from "react-router-dom";
import { getAccessToken } from "../../../../utils/authTokens";
import { createProduct } from "../../../../api/calculatorApi";

const FabricType = ({
    setTemplate,
    fabric,
    setComponents,
    setCustomComponents,
    id,
    setProduct,
    setKitCommentText,
    setForm,
    isEdit,
    isLoading,
    setIsLoading,
    setFabricConsumption,
    setComponentSizes,
    setIsKitSplitted,
    onFabricTypeChange,
}) => {
    const [fabrics, setFabrics] = useState(null);
    const [selectedFabric, setSelectedFabric] = useState(null);
    const navigate = useNavigate();

    const setObject = (value, isEdit = false) => {
        if (value?.kit?.length > 0 && isEdit) {
            const componentSizes = [];
            if (value.kit[0].is_split) {
                setComponents(value.kit[0]);
                value.kit[0].components.forEach(component => {
                    componentSizes.push({
                        id: component.id,
                        sizes: [{
                            id: component.id,
                            name: component.name,
                            price: component.price,
                            size: component.size.name,
                            image: component.image
                        }],
                        selected: 0
                    })
                })
                setForm(prevForm => ({
                    ...prevForm,
                    template_components: value.kit[0].components.map((item) => ({
                        kit_template_id: value.kit[0]?.template_size?.id,
                        component_template_id: item?.id,
                        option: item?.options?.filter(el => el?.selected).map((el) => el.id),
                        comment: item?.comment,
                        custom_size: item?.custom_size
                    })),
                    additional_components: []
                }))
            } else {
                const components = [];
                const customComponents = [];
                for (const component of value.kit[0].components) {
                    if (component.is_custom) {
                        customComponents.push({ ...component, is_main: true });
                    } else {
                        components.push({ ...component, is_main: true });
                        componentSizes.push({
                            id: component.id,
                            sizes: [{
                                id: component.id,
                                name: component.name,
                                price: component.price,
                                size: component.size.name,
                                image: component.image
                            }],
                            selected: 0
                        })
                    }
                }
                setComponents({ ...value.kit[0], components: components });
                setCustomComponents(customComponents);
                setForm(prevForm => ({
                    ...prevForm,
                    template_components: components.map((item) => ({
                        kit_template_id: value.kit[0]?.template_size?.id,
                        component_template_id: item?.id,
                        option: item?.options?.filter(el => el?.selected).map((el) => el.id),
                        ...(!!item.comment && { comment: item.comment }),
                        ...(!!item.custom_size && { custom_size: item.custom_size })
                    })),
                    additional_components: customComponents.map((item) => ({
                        is_main: true,
                        kit_template_id: 0,
                        component_template_id: item.id,
                        option: item?.options?.filter(el => el?.selected).map((el) => el.id),
                        ...(!!item.comment && { comment: item.comment }),
                        ...(!!item.custom_size && { custom_size: item.custom_size })
                    }))
                }));
            }
            setComponentSizes(componentSizes);
            setFabricConsumption(Math.round(value.kit[0]?.additional_fabric_consumption_count * 100) ?? 0);
            const { image } = value.fabric_types.find(type => type.selected);
            onFabricTypeChange({ ...value.kit[0].fabric, image: image });
            setIsKitSplitted(value.kit[0].is_split);
        }
        setTemplate(value);
        const newArray = value.fabric_types.map((item) => {
            return (
                {
                    name: item.type,
                    img: item.image ? item.image : '',
                    id: item.id,
                }
            )
        });
        setFabrics(newArray);
    }

    useEffect(() => {
        const accessToken = getAccessToken();
        setIsLoading(true);
        if (id) {
            createProduct(accessToken, id).then((resp) => {
                if (resp?.detail) {
                    navigate('/');
                    return;
                }
                setObject(resp, true);
                setProduct({
                    kit: resp.kit,
                    kit_comment: resp.kit_comment,
                    kit_options: resp.kit_options,
                })
                setKitCommentText(resp.kit_comment);
                setForm(prevForm => ({
                    ...prevForm,
                    order_id: Number(id),
                    fabric_id: resp.kit[0]?.fabric?.id,
                    custom_size: "",
                    option: [],
                }));
            }).finally(() => {
                setIsLoading(false);
            })
        } else {
            createProduct(accessToken).then((result) => {
                setObject(result);
            }).finally(() => {
                setIsLoading(false);
            })
        }
    }, [])

    return (
        <div className={styles.type}>
            <h3>Пара тканин</h3>
            <FabricArticles fabric={fabric}/>
            {fabrics && (
                <FabricTypeFabrics
                    fabricTypes={fabrics}
                    selectedFabric={selectedFabric}
                    setSelectedFabric={setSelectedFabric}
                    isEdit={isEdit}
                    fabric={fabric}
                    isLoading={isLoading}
                    setIsLoading={setIsLoading}
                    onFabricTypeChange={onFabricTypeChange}
                />
            )}
        </div>
    )
}

export default FabricType