import styles from './FabricSize.module.scss';

export default function FabricSizeSecond({
    activeSecondSize,
    setActiveSecondSize,
    orderId,
    setComponents,
    setForm,
    monoFabricType,
    product,
    isEdit,
    setFabricConsumption,
    setComponentSizes
}) {
    const handleSelectSecondSize = (idx, components) => {
        setActiveSecondSize(idx);

        if (monoFabricType.length !== 2) {
            const kitComponents = components.components.map(item => ({
                ...item,
                mono_fabric_type: monoFabricType.join('')
            }));

            setComponents({ ...components, components: kitComponents });
        } else {
            setComponents(components);
        }

        const componentSizes = components.components.map(component => ({
            id: component.id,
            sizes: [{
                id: component.id,
                name: component.name,
                price: component.price,
                size: component.size.name,
                image: component.image
            }],
            selected: 0
        }));

        setComponentSizes(componentSizes);
        setFabricConsumption(Math.round(components?.additional_fabric_consumption_count * 100) ?? 0);

        setForm({
            order_id: Number(orderId),
            fabric_id: product.kit[idx]?.fabric?.id,
            template_components: product.kit[idx].components.map((item) => {
                return {
                    kit_template_id: product.kit[idx]?.id,
                    component_template_id: item?.id,
                    option: [],
                };
            }),
            additional_components: [],
            custom_size: "",
            option: [],
        });
    };

    return (
        <div className={styles.size}>
            <div className={styles.size__kitRow}>
                {product?.kit.map((el, index) => {
                    const isZeroPrice = Number(el.starting_price) === 0;
                    const isDisabled = isEdit || isZeroPrice;

                    return (
                        <div
                            key={index}
                            className={`
                                ${styles.item}
                                ${styles.kitItem}
                                ${!isEdit && activeSecondSize === index ? styles.activeStandard : ""}
                                ${isEdit ? styles.activeStandard : ""}
                                ${isZeroPrice ? styles.disabledKitItem : ""}
                            `}
                            onClick={!isDisabled ? () => handleSelectSecondSize(index, el) : undefined}
                            aria-disabled={isDisabled}
                        >
                            <div className={`${styles.item__panel} ${styles.item__kitPanel}`}>
                                <span>{el.short_name}</span>
                            </div>

                            <p className={styles.item__fullName}>
                                {el.name} <span>({el.starting_price} грн)</span>
                            </p>

                            {isZeroPrice && (
                                <p className={styles.disabledKitText}>
                                    * Комплект з нульовою ціною недоступний для додавання
                                </p>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}