import React, {useEffect, useMemo, useState} from "react";
import styles from './Calculator.module.scss';
import FabricType from "./FabricType/FabricType";
import FabricSize from "./FabricSize/FabricSize";
import FabricOptions from "./FabricOptions/FabricOptions";
import FabricSet from "./FabricSet/FabricSet";
import CalcButton from "./CalcButton/CalcButton";
import FabricPrice from "./FabricPrice/FabricPrice";
import { getAccessToken } from "../../../utils/authTokens";
import { getFabricTemplate, getMonoFabricTypeTemplates, setKit, setSplitKit, setUpdateKit } from "../../../api/calculatorApi";
import {getOrderInfo} from "../../../api/ordersApi";
import { getCartOrder } from "../../../api/productsApi";
import {useAppDispatch} from "../../../hooks/redux";
import {setIsActivePopup} from "../../../store/main-slice";
import GlobalPopup from "../../Common/GlobalPopup/GlobalPopup";
import FabricSizeSecond from "./FabricSize/FabricSizeSecond";
import AddCommentButton from "./CommentButton/AddCommentButton";
import KitCommentPopup from "./Popups/CommentPopup/KitCommentPopup";
import AddComponentButton from "./ComponentButton/AddComponentButton";
import ComponentsPopup from "./Popups/ComponentsPopup/ComponentsPopup";
import {useParams} from "react-router-dom";
import {useNavigate} from "react-router";
import Preloader from "../../Common/Preloader/Preloader";
import GlobalCalculator from "../../Common/GlobalCalculator/GlobalCalculator";
import {useIsDesktop} from "../../../hooks/useIsDesktop";
import ArrBack from "../../Common/ArrBack/ArrBack";

const Calculator = () => {
    const {orderId, id} = useParams();
    const navigate = useNavigate();

    const [showKitCommentPopup, setShowKitCommentPopup] = useState(false);
    const [showComponentPopup, setShowComponentPopup] = useState(false);
    const [showFabricAmountPopup, setShowFabricAmountPopup] = useState(false);
    const [template, setTemplate] = useState(null);
    const [activeSecondSize, setActiveSecondSize] = useState(null);
    const [size, setSize] = useState(null);
    const [customTemplateSize, setCustomTemplateSize] = useState(null);
    const [activeSize, setActiveSize] = useState({ index: null, standard: 1 });
    const [components, setComponents] = useState(null);
    const [fabric, setFabric] = useState(null);
    const dispatch = useAppDispatch();
    const [product, setProduct] = useState(null);
    const [form, setForm] = useState(null);
    const [kitCommentText, setKitCommentText] = useState("");
    const [customComponents, setCustomComponents] = useState([]);
    const [selectedOptionIds, setSelectedOptionIds] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [fabricConsumption, setFabricConsumption] = useState(0);
    const [componentSizes, setComponentSizes] = useState([]);
    const [isKitSplitted, setIsKitSplitted] = useState(false);
    const [sourceID, setSourceID] = useState(null);
    const [noKitBanner, setNoKitBanner] = useState(null);
    const [backendErrorText, setBackendErrorText] = useState("");
    // the edited kit is already being made (cart line `manufacturing`): it can't be changed any more
    const [manufacturing, setManufacturing] = useState(null);

    const isDesktop = useIsDesktop();

    useEffect(() => {
        if (fabric && size) {
            const accessToken = getAccessToken();
            setIsLoading(true);

            getFabricTemplate(accessToken, fabric.id, size.id, sourceID)
                .then((resp) => {
                    if (resp && resp.kit) {
                        setProduct(resp);
                        setNoKitBanner(null);
                    } else {
                        setForm(null);
                        setProduct(null);
                        setComponents(null);
                        setCustomComponents([]);
                        setKitCommentText("");
                        setSelectedOptionIds([]);
                        setNoKitBanner('За вибраними даними комплекту не існує');
                    }
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }
    }, [fabric, size, sourceID]);

    useEffect(() => {
        if (!orderId || !id) return;

        getCartOrder(getAccessToken(), orderId)
            .then((resp) => {
                const line = Array.isArray(resp) ? resp.find((item) => String(item.id) === String(id)) : null;
                setManufacturing(line?.manufacturing ?? null);
            })
            .catch((err) => console.error(err));
    }, [orderId, id]);

    useEffect(() => {
        if (!orderId) return;

        const accessToken = getAccessToken();
        getOrderInfo(accessToken, orderId)
            .then((resp) => {
                if (resp?.source?.id) {
                    setSourceID(resp.source.id);
                    console.log(resp);
                } else {
                    setSourceID(null);
                }
            })
            .catch((err) => {
                console.error(err);
            });
    }, [orderId]);

    const getBackendErrorText = (resp) => {
        const rawError =
            resp?.errors?.component_price ??
            resp?.[0]?.errors?.component_price ??
            resp?.errors?.detail ??
            resp?.detail ??
            resp?.message ??
            resp?.error ??
            "";

        return typeof rawError === "string" ? rawError : "";
    };

    const calcSave = () => {
        setBackendErrorText("");
        const isEdit = !!id;

        if (!isEdit) {
            const updatedForm = {
                ...form,
                comment: kitCommentText,
                option: [...selectedOptionIds],
                custom_size: customTemplateSize,
                additional_fabric_consumption_count: fabricConsumption,
                is_split: isKitSplitted
            };

            setForm(updatedForm);

            const accessToken = getAccessToken();
            setKit(accessToken, updatedForm)
                .then(resp => {
                    const backendError = getBackendErrorText(resp);

                    if (backendError) {
                        setBackendErrorText(backendError);
                        console.log(resp);
                    }

                    if (resp?.status === 404) {
                        alert('Неможливо додати комплект, адже залишки обраної тканини дорівнюють 0.');
                        console.log(resp);
                        return;
                    }

                    if (resp?.status === 500) {
                        alert('Вибачте, виникла помилка. Неможливо додати комплект');
                        console.log(resp);
                        return;
                    }

                    if (resp?.order_product_id) {
                        console.log(resp);
                        navigate(`/products/${orderId}`);
                    } else {
                        console.log(resp);
                    }
                })
                .catch(err => console.error(err));
        } else {
            const mainComponents = (form?.additional_components || []).filter(item => item.is_main);
            const additionalComponents = (form?.additional_components || []).filter(item => !item.is_main);

            const formattedEditForm = {
                component: [...(form?.template_components || []), ...mainComponents].map(item => ({
                    id: item.component_template_id,
                    ...(item?.original_size_id && { original_size_id: item.original_size_id }),
                    option: item.option,
                    ...(item?.custom_size !== undefined && { custom_size: item.custom_size }),
                    ...(item?.comment !== undefined && { comment: item.comment }),
                    ...(item?.mono_fabric_type !== undefined && { mono_fabric_type: item.mono_fabric_type })
                })),
                ...(form?.new_fabric && { new_fabric: form.new_fabric }),
                additional_components: additionalComponents,
                is_split: isKitSplitted,
                custom_size: customTemplateSize,
                comment: kitCommentText,
                option: [...selectedOptionIds],
                additional_fabric_consumption_count: fabricConsumption,
            };

            const accessToken = getAccessToken();
            setUpdateKit(accessToken, formattedEditForm, product?.kit?.[0]?.id)
                .then((response) => {
                    const backendError = getBackendErrorText(response);

                    if (backendError) {
                        setBackendErrorText(backendError);
                        console.log(response);
                    }

                    if (response?.order_product_id) {
                        navigate(`/products/${orderId}`);
                    } else {
                        console.log(response);
                    }
                })
                .catch(err => console.error(err));
        }
    };

    const openKitCommentPopup = () => {
        setShowKitCommentPopup(true);
        dispatch(setIsActivePopup(true));
    };

    const onSaveKitComment = () => {
        setShowKitCommentPopup(false);
        dispatch(setIsActivePopup(false));
    };

    const openComponentPopup = () => {
        setShowComponentPopup(true);
        dispatch(setIsActivePopup(true));
    };

    const openFabricConsumptionPopup = () => {
        setShowFabricAmountPopup(true);
        dispatch(setIsActivePopup(true));
    };

    const handleFabricConsumptionDelete = () => {
        let newValue = Math.floor(fabricConsumption / 10);
        setFabricConsumption(newValue);
    };

    const handleFabricConsumptionChange = (e) => {
        const value = e.target.textContent;
        const fabricString = String(fabricConsumption);
        const newFabricValue = Number(fabricString + value);

        if (newFabricValue <= 100000) {
            setFabricConsumption(newFabricValue);
        }
    };

    const addCustomComponent = (newComponent) => {
        setCustomComponents(prevComponents => [...prevComponents, { ...newComponent, is_main: false }]);
        setForm(prevForm => ({
            ...prevForm,
            additional_components: [
                ...(prevForm?.additional_components || []),
                {
                    kit_template_id: 0,
                    component_template_id: newComponent.id,
                    option: [],
                }
            ]
        }));
        setShowComponentPopup(false);
        dispatch(setIsActivePopup(false));
    };

    const buildMergedComponentSizes = (existingSizes, incomingSizes) => {
        if (!incomingSizes?.length) return existingSizes || [];

        if (!existingSizes?.length) {
            return incomingSizes.map((group, index) => {
                const selectedComponentId =
                    form?.template_components?.[index]?.component_template_id ??
                    components?.components?.[index]?.id;

                const selectedIndex = group.sizes.findIndex(
                    (sizeItem) => Number(sizeItem.id) === Number(selectedComponentId)
                );

                return {
                    ...group,
                    selected: selectedIndex >= 0 ? selectedIndex : null,
                };
            });
        }

        return incomingSizes.map((incomingGroup, index) => {
            const existingGroup = existingSizes.find(
                (group) => Number(group.id) === Number(incomingGroup.id)
            );

            const currentSizes = existingGroup?.sizes || [];
            const mergedSizes = [
                ...currentSizes,
                ...incomingGroup.sizes.filter(
                    (incomingSize) =>
                        !currentSizes.some(
                            (currentSize) => Number(currentSize.id) === Number(incomingSize.id)
                        )
                )
            ];

            const selectedComponentId =
                form?.template_components?.[index]?.component_template_id ??
                components?.components?.[index]?.id;

            const selectedIndex = mergedSizes.findIndex(
                (sizeItem) => Number(sizeItem.id) === Number(selectedComponentId)
            );

            return {
                ...incomingGroup,
                sizes: mergedSizes,
                selected: selectedIndex >= 0 ? selectedIndex : existingGroup?.selected ?? null,
            };
        });
    };

    const splitKit = () => {
        const accessToken = getAccessToken();
        setIsLoading(true);

        const currentKitId = product?.kit?.[0]?.id ?? components?.id;

        const payload = id
            ? { kit_id: currentKitId, source_id: sourceID }
            : { kit_template_id: components?.id, source_id: sourceID };

        setSplitKit(accessToken, payload)
            .then(resp => {
                if (resp?.length > 0) {
                    const incomingComponentSizes = resp.map((group) => ({
                        id: group.id,
                        sizes: (group.components || []).map((component) => ({
                            id: component.id,
                            name: component.name,
                            price: component.price,
                            size: component.size,
                            image: component.image?.[0]
                        }))
                    }));

                    const mergedComponentSizes = buildMergedComponentSizes(
                        componentSizes,
                        incomingComponentSizes
                    );

                    setComponentSizes(mergedComponentSizes);
                    setIsKitSplitted(true);
                }
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    const handleSelectSize = (componentIndex, sizeIndex) => {
        const newComponentSizes = componentSizes.map((component, idx) => ({
            ...component,
            selected: componentIndex === idx ? sizeIndex : component.selected
        }));

        setComponentSizes(newComponentSizes);

        setForm(prevForm => ({
            ...prevForm,
            template_components: (prevForm?.template_components || []).map((component, idx) => ({
                ...component,
                component_template_id: idx === componentIndex
                    ? newComponentSizes[idx].sizes[sizeIndex].id
                    : component.component_template_id,
                ...(id && idx === componentIndex && { original_size_id: newComponentSizes[idx].id })
            }))
        }));
    };

    const resetKitValues = () => {
        setComponents(prevComponents => prevComponents ? ({ ...prevComponents, components: [] }) : prevComponents);
        setForm(prevForm => prevForm ? ({ ...prevForm, template_components: [] }) : prevForm);
        setComponentSizes([]);
        setCustomComponents([]);
        setActiveSecondSize(null);
        setIsKitSplitted(false);
        setNoKitBanner(null);
        setBackendErrorText("");
    };

    const handleFabricTypeChange = (newFabric) => {
        if (!!id) {
            if (!fabric) {
                setFabric(newFabric);
            } else {
                setFabric(prevFabric => ({ ...prevFabric, mono_fabric_type: newFabric.mono_fabric_type }));
                const newTemplateComponents = (form?.template_components || []).map(({ mono_fabric_type, ...rest }) => rest);
                setForm(prevForm => ({ ...prevForm, template_components: newTemplateComponents, new_fabric: newFabric.id }));

                if (newFabric.mono_fabric_type.length !== 2) {
                    const kitComponents = (components?.components || []).map(component => ({
                        ...component,
                        mono_fabric_type: newFabric.mono_fabric_type.join(''),
                    }));
                    setComponents(prevComponents => ({ ...prevComponents, components: kitComponents }));
                } else {
                    const kitComponents = [];
                    const accessToken = getAccessToken();
                    getMonoFabricTypeTemplates(accessToken).then(resp => {
                        if (resp?.length > 0) {
                            for (const component of (components?.components || [])) {
                                let type = resp.find(el => el.id === component.type_id);
                                kitComponents.push({ ...component, mono_fabric_type: type.mono_fabric_type });
                            }
                            setComponents(prevComponents => ({ ...prevComponents, components: kitComponents }));
                        }
                    });
                }
            }
        } else {
            setFabric(newFabric);

            if (fabric?.type?.id === newFabric?.type?.id) {
                const newTemplateComponents = (form?.template_components || []).map(({ mono_fabric_type, ...rest }) => rest);
                setForm(prevForm => ({ ...prevForm, template_components: newTemplateComponents, fabric_id: newFabric.id }));

                if (newFabric.mono_fabric_type.length !== 2) {
                    const kitComponents = (components?.components || []).map(item => ({
                        ...item,
                        mono_fabric_type: newFabric.mono_fabric_type.join('')
                    }));
                    setComponents({ ...components, components: kitComponents });
                } else {
                    const kitComponents = [];
                    const accessToken = getAccessToken();
                    getMonoFabricTypeTemplates(accessToken).then(resp => {
                        if (resp?.length > 0) {
                            for (const component of (components?.components || [])) {
                                let type = resp.find(el => el.id === component.type_id);
                                kitComponents.push({ ...component, mono_fabric_type: type.mono_fabric_type });
                            }
                            setComponents(prevComponents => ({ ...prevComponents, components: kitComponents }));
                        }
                    });
                }
            } else {
                const initialActiveSize = {index: null, standard: 1};
                setActiveSize(initialActiveSize);
                resetKitValues();
            }
        }
    };

    const getOptionsSumByIds = (selectedIds = [], options = []) => {
        return options.reduce((sum, option) => {
            return selectedIds.includes(option.id)
                ? sum + Number(option.price || 0)
                : sum;
        }, 0);
    };

    const currentKitOptionsTotal = useMemo(() => {
        return getOptionsSumByIds(
            selectedOptionIds,
            product?.kit_options || []
        );
    }, [selectedOptionIds, product]);

    const currentTemplateComponentsOptionsTotal = useMemo(() => {
        return (form?.template_components || []).reduce((sum, formItem, index) => {
            const selectedIds = formItem?.option || [];
            const options = components?.components?.[index]?.options || [];

            return sum + getOptionsSumByIds(selectedIds, options);
        }, 0);
    }, [form, components]);

    // custom components and form.additional_components share their order (saved ones first, then added ones),
    // the same pairing FabricSetItem uses when it changes a component's options
    const currentCustomComponentsOptionsTotal = useMemo(() => {
        return (customComponents || []).reduce((sum, component, index) => {
            const selectedIds = form?.additional_components?.[index]?.option || [];

            return sum + getOptionsSumByIds(selectedIds, component?.options || []);
        }, 0);
    }, [form, customComponents]);

    const splitTemplateComponentsBasePrice = useMemo(() => {
        return (components?.components || []).reduce((sum, component, index) => {
            const selectedComponentId =
                form?.template_components?.[index]?.component_template_id ??
                component?.id;

            const selectedVariant = componentSizes?.[index]?.sizes?.find(
                (sizeItem) => Number(sizeItem.id) === Number(selectedComponentId)
            );

            return sum + Number(selectedVariant?.price ?? component?.price ?? 0);
        }, 0);
    }, [components, componentSizes, form]);

    const customComponentsBasePrice = useMemo(() => {
        return (customComponents || []).reduce((sum, component) => {
            return sum + Number(component?.price || 0);
        }, 0);
    }, [customComponents]);

    // The price is built from its parts in every mode, so it is what gets saved: the template's price (a saved
    // kit's own `price` already includes its options, so it can't be the base) or, once the kit is split, its
    // components' prices; plus added components and the options selected now.
    const basePrice = useMemo(() => {
        if (isKitSplitted) {
            return splitTemplateComponentsBasePrice + customComponentsBasePrice;
        }

        return Number(components?.starting_price ?? components?.price ?? 0) + customComponentsBasePrice;
    }, [isKitSplitted, splitTemplateComponentsBasePrice, customComponentsBasePrice, components]);

    const displayPrice = basePrice
        + currentKitOptionsTotal
        + currentTemplateComponentsOptionsTotal
        + currentCustomComponentsOptionsTotal;

    const hasPositivePrice = Number.isFinite(displayPrice) && displayPrice > 0;

    return (
        <div className={styles.calculator}>
            <div className={styles.calcWrap}>
                 {isDesktop && <ArrBack />}
                {/* a kit in production is read-only: nothing in it can be clicked or focused (see the caption below) */}
                <div className={manufacturing ? styles.readOnly : undefined} {...(manufacturing ? { inert: '' } : {})}>
                <h2>Тип тканини</h2>
                <FabricType
                    setTemplate={setTemplate}
                    fabric={fabric}
                    setComponents={setComponents}
                    id={id}
                    setProduct={setProduct}
                    setKitCommentText={setKitCommentText}
                    setForm={setForm}
                    isEdit={!!id}
                    isLoading={isLoading}
                    setIsLoading={setIsLoading}
                    setFabricConsumption={setFabricConsumption}
                    setComponentSizes={setComponentSizes}
                    setIsKitSplitted={setIsKitSplitted}
                    onFabricTypeChange={handleFabricTypeChange}
                    setCustomComponents={setCustomComponents}
                />

                <h2>Розмір комплекту</h2>
                <FabricSize
                    activeSize={activeSize}
                    setActiveSize={setActiveSize}
                    kitTemplateSizes={template?.kit_template_size}
                    setKitSize={setSize}
                    setCustomTemplateSize={setCustomTemplateSize}
                    isEdit={!!id}
                    onSizeChange={resetKitValues}
                />

                {noKitBanner && <p className={styles.noKitBanner}>{noKitBanner}</p>}

                {product && product.kit && (
                    <>
                        <h2>Варіації комплектів по вибраним параметрам</h2>
                        <FabricSizeSecond
                            activeSecondSize={activeSecondSize}
                            setActiveSecondSize={(idx) => {
                                setActiveSecondSize(idx);
                                setIsKitSplitted(false);
                                setCustomComponents([]);
                                setSelectedOptionIds([]);
                                setBackendErrorText("");
                            }}
                            orderId={orderId}
                            setComponents={setComponents}
                            setForm={setForm}
                            product={product}
                            monoFabricType={fabric?.mono_fabric_type || []}
                            isEdit={!!id}
                            setFabricConsumption={setFabricConsumption}
                            setComponentSizes={setComponentSizes}
                        />
                    </>
                )}

                {((components?.components?.length > 0) || (customComponents?.length > 0)) && (
                    <div className={styles.kitWrapper}>
                        <h2 className={styles.setTitle}>Комплект</h2>

                        {!isKitSplitted && components?.components?.length > 0 && (
                            <div className={styles.templateKitWrapper}>
                                <div className={styles.kitSplitButton}>
                                    <button onClick={splitKit}>Розформувати комплект</button>
                                </div>

                                <FabricSet
                                    components={components.components}
                                    setComponents={setComponents}
                                    kitId={components.id}
                                    types={fabric?.mono_fabric_type}
                                    form={form}
                                    setForm={setForm}
                                    isEdit={!!id}
                                    componentSizes={componentSizes}
                                    onSelectSize={handleSelectSize}
                                    isKitSplitted={isKitSplitted}
                                    defaultFabricImage={fabric?.image || fabric?.type.image}
                                />
                            </div>
                        )}

                        {isKitSplitted && components?.components?.length > 0 && (
                            <FabricSet
                                components={components.components}
                                setComponents={setComponents}
                                kitId={components.id}
                                types={fabric?.mono_fabric_type}
                                form={form}
                                setForm={setForm}
                                isEdit={!!id}
                                componentSizes={componentSizes}
                                onSelectSize={handleSelectSize}
                                isKitSplitted={isKitSplitted}
                                setComponentSizes={setComponentSizes}
                                defaultFabricImage={fabric?.image || fabric?.type.image}
                            />
                        )}

                        {customComponents?.length > 0 && (
                            <FabricSet
                                customComponents={customComponents}
                                setCustomComponents={setCustomComponents}
                                kitId={components.id}
                                types={fabric?.mono_fabric_type}
                                form={form}
                                setForm={setForm}
                                isEdit={!!id}
                                componentSizes={componentSizes}
                                onSelectSize={handleSelectSize}
                                isKitSplitted={isKitSplitted}
                                defaultFabricImage={fabric?.image || fabric?.type.image}
                            />
                        )}
                    </div>
                )}

                {(product?.kit_options && ((components?.components?.length > 0) || (customComponents?.length > 0))) && (
                    <>
                        <div className={styles.bottomKitButtons}>
                            <AddCommentButton onClick={openKitCommentPopup}/>
                            <AddComponentButton onClick={openComponentPopup}/>
                        </div>

                        <h2>Опції</h2>
                        <FabricOptions
                            options={product.kit_options}
                            selectedOptionIds={selectedOptionIds}
                            setSelectedOptionIds={setSelectedOptionIds}
                            openFabricConsumptionPopup={openFabricConsumptionPopup}
                            fabricConsumption={fabricConsumption}
                            isEdit={!!id}
                        />
                    </>
                )}

                </div>

                <CalcButton
                    action={calcSave}
                    isDisabled={
                        !components ||
                        (components?.components?.length === 0 && customComponents?.length === 0) ||
                        !hasPositivePrice ||
                        !!manufacturing
                    }
                    buttonName="Обрахувати і Зберегти"
                />

                {manufacturing && (
                    <p>*Комплект уже у виробництві (статус: {manufacturing.status}), змінити його не можна</p>
                )}

                {backendErrorText && (
                    <p className={styles.backendError}>*{backendErrorText}</p>
                )}

                {hasPositivePrice && (
                    <FabricPrice price={displayPrice} id={id} />
                )}

                {product?.kit && ((components?.components?.length > 0) || (customComponents?.length > 0)) && !hasPositivePrice && (
                    <p>*Не можна обрахувати і зберегти комплект з нульовою ціною</p>
                )}

                {showKitCommentPopup && (
                    <GlobalPopup
                        title={'Коментар'}
                        onClose={() => setShowKitCommentPopup(false)}
                        {...(isDesktop ? { centeredPopup: true } : { topPopup: true })}
                    >
                        <KitCommentPopup
                            kitCommentText={kitCommentText}
                            setKitCommentText={setKitCommentText}
                            onSaveKitComment={onSaveKitComment}
                        />
                    </GlobalPopup>
                )}

                {showComponentPopup && (
                    <GlobalPopup topPopup title={'Комплектуючі:'} onClose={() => setShowComponentPopup(false)}>
                        <ComponentsPopup
                            addCustomComponent={addCustomComponent}
                            defaultFabricImage={fabric?.image || fabric?.type.image}
                            fabricId={fabric?.id}
                            sourceID={sourceID}
                        />
                    </GlobalPopup>
                )}

                {showFabricAmountPopup && (
                    <GlobalPopup
                        title={'Витрата тканини:'}
                        onClose={() => setShowFabricAmountPopup(false)}
                        {...(isDesktop ? { centeredPopup: true } : {})}
                    >
                        <GlobalCalculator
                            handleChange={handleFabricConsumptionChange}
                            handleDelete={handleFabricConsumptionDelete}
                            onSubmit={() => setShowFabricAmountPopup(false)}
                        >
                            <div className={styles.fabricInputWrap}>
                                <input
                                    id='fabric_amount'
                                    name="fabric_amount"
                                    value={fabricConsumption}
                                    className={'baseInput'}
                                    type="text"
                                    readOnly
                                />
                                <span>&nbsp;см</span>
                            </div>
                        </GlobalCalculator>
                    </GlobalPopup>
                )}

                {isLoading && <Preloader />}
            </div>
        </div>
    );
};

export default Calculator;