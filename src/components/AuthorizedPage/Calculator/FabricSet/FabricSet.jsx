import React from "react";
import styles from './FabricSet.module.scss';
import FabricSetItem from "./FabricSetItem/FabricSetItem";
import { removeKitComponent } from "../../../../api/calculatorApi";
import { getAccessToken } from "../../../../utils/authTokens";

const FabricSet = ({
                       components,
                       setComponents,
                       customComponents,
                       setCustomComponents,
                       kitId,
                       types,
                       form,
                       setForm,
                       isEdit,
                       componentSizes,
                       setComponentSizes,
                       onSelectSize,
                       isKitSplitted,
                       defaultFabricImage
                   }) => {

    const onChangeOptions = (value, index, type, isCustom = false) => {
        const key = isCustom ? 'additional_components' : 'template_components';
        const newValues = {};

        if (!form?.[key]?.[index]) return;

        if (type === 'option') {
            if (Array.isArray(value)) {
                newValues.option = value;
            } else {
                const options = form[key][index].option || [];
                if (options.includes(value)) {
                    newValues.option = options.filter((el) => el !== value);
                } else {
                    newValues.option = [...options, value];
                }
            }
        } else if (type === 'comment') {
            newValues.comment = value;
        } else if (type === 'custom_size') {
            newValues.custom_size = value;
        } else if (type === 'mono_fabric_type') {
            newValues.mono_fabric_type = value;

            const newComponents = (components || []).map((item, idx) => {
                if (idx === index) {
                    return { ...item, mono_fabric_type: value };
                }
                return item;
            });

            setComponents(prevComponents => ({ ...prevComponents, components: newComponents }));
        }

        setForm(prevForm => ({
            ...prevForm,
            [key]: (prevForm?.[key] || []).map((item, idx) => {
                if (idx === index) {
                    return { ...item, ...newValues };
                }
                return item;
            })
        }));
    };

    const handleDeleteComponent = (idx, itemId) => {
        if (isKitSplitted) {
            if (isEdit) {
                const accessToken = getAccessToken();
                removeKitComponent(accessToken, kitId, itemId).then(result => {
                    if (result && result.kit && result.kit.length > 0) {
                        setComponents(prevComponents => ({ ...prevComponents, components: result.kit[0].components }));

                        const newTemplateComponents = (form?.template_components || []).filter(
                            (item) => item.component_template_id !== itemId
                        );

                        setForm(prevForm => ({ ...prevForm, template_components: newTemplateComponents }));
                        setComponentSizes(prevSizes => prevSizes.filter((_, index) => index !== idx));
                    } else {
                        console.log(result);
                    }
                });
            } else {
                const newComponents = (components || []).filter((_, index) => index !== idx);
                setComponents(prevComponents => ({ ...prevComponents, components: newComponents }));

                setForm(prevForm => ({
                    ...prevForm,
                    template_components: (prevForm?.template_components || []).filter((_, index) => index !== idx)
                }));

                setComponentSizes(prevSizes => prevSizes.filter((_, index) => index !== idx));
            }
        }
    };

    const handleDeleteCustomComponent = (idx, itemId) => {
        if (customComponents?.[idx]?.is_main) {
            const accessToken = getAccessToken();
            removeKitComponent(accessToken, kitId, itemId).then(result => {
                if (result.kit) {
                    const newCustomComponents = (customComponents || []).filter((_, index) => index !== idx);
                    setCustomComponents(newCustomComponents);

                    setForm(prevForm => ({
                        ...prevForm,
                        additional_components: (prevForm?.additional_components || []).filter((_, index) => index !== idx)
                    }));
                } else {
                    console.log(result);
                }
            });
        } else {
            const newCustomComponents = (customComponents || []).filter((_, index) => index !== idx);
            setCustomComponents(newCustomComponents);

            setForm(prevForm => ({
                ...prevForm,
                additional_components: (prevForm?.additional_components || []).filter((_, index) => index !== idx)
            }));
        }
    };

    const additionalOnlyFormComponents = (form?.additional_components || []).filter(item => !item?.is_main);

    return (
        <div>
            {components?.length === 0 && customComponents?.length === 0 && (
                <p className={styles.warning}>Очікуємо доступні комплекти</p>
            )}

            {Array.isArray(components) && components.length > 0 && (
                components.map((el, index) => {
                    const selectedOptionIds = form?.template_components?.[index]?.option || [];

                    const selectedComponentId =
                        form?.template_components?.[index]?.component_template_id ?? el?.id;

                    const selectedVariant = componentSizes?.[index]?.sizes?.find(
                        (sizeItem) => Number(sizeItem.id) === Number(selectedComponentId)
                    );

                    const displayPrice = Number(selectedVariant?.price ?? el?.price ?? 0);

                    return (
                        <FabricSetItem
                            componentIndex={index}
                            item={el}
                            key={index}
                            types={types}
                            onChangeOptions={onChangeOptions}
                            form={form}
                            onDelete={handleDeleteComponent}
                            isEdit={isEdit}
                            componentSize={componentSizes[index]}
                            onSelectSize={onSelectSize}
                            onSelectMonoFabricType={(value) => onChangeOptions(value, index, 'mono_fabric_type')}
                            isKitSplitted={isKitSplitted}
                            defaultFabricImage={defaultFabricImage}
                            selectedOptionIds={selectedOptionIds}
                            displayPrice={displayPrice}
                        />
                    );
                })
            )}

            {Array.isArray(customComponents) && customComponents.length > 0 && (
                customComponents.map((el, index) => (
                    <FabricSetItem
                        componentIndex={index}
                        item={el}
                        key={index}
                        types={types}
                        onChangeOptions={onChangeOptions}
                        form={form}
                        onDelete={handleDeleteCustomComponent}
                        isEdit={isEdit}
                        defaultFabricImage={defaultFabricImage}
                        isCustom={true}
                        selectedOptionIds={additionalOnlyFormComponents?.[index]?.option || []}
                        displayPrice={Number(el?.price || 0)}
                    />
                ))
            )}
        </div>
    );
};

export default FabricSet;