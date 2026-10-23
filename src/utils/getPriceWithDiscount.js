export const getPriceWithDiscount = (totalPrice, discountType, discountValue) => {
    if (!totalPrice) return 0;
    return discountType === 'PERC'
        ? Math.ceil(totalPrice - (totalPrice * discountValue) / 100)
        : totalPrice - discountValue;
}