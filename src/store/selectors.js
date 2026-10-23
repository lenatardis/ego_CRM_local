// Public base of this demo (was the original site): "copy link" buttons build /product/?id=… links from it.
export const getBaseUrl = `${window.location.origin}${process.env.PUBLIC_URL}`;

export const getIsAuth = (state) => state.account.isAuth;
export const getUser = (state) => state.account.user;

export const getIsActivePopup = (state) => state.main.isActivePopup;
export const getOrderList = (state) => state.main.orders;
export const getFabricsAll = (state) => state.main.fabricsAll;

export const getUserProductId = (state) => state.main.userProduct.id;
export const getUserProductImages = (state) => state.main.userProduct.images;
export const getIsNotFound = (state) => state.main.isNotFound;
export const getGeneralOrderId = (state) => state.main.generalOrderId;