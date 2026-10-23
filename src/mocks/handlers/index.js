import { authHandlers } from './auth';
import { orderHandlers } from './orders';
import { customerHandlers } from './customers';
import { paymentHandlers } from './payments';
import { deliveryHandlers } from './delivery';
import { productHandlers } from './products';
import { calculatorHandlers } from './calculator';

export const handlers = [
    ...authHandlers,
    ...orderHandlers,
    ...customerHandlers,
    ...paymentHandlers,
    ...deliveryHandlers,
    ...productHandlers,
    ...calculatorHandlers,
];
