import { authHandlers } from './auth';
import { orderHandlers } from './orders';
import { customerHandlers } from './customers';
import { paymentHandlers } from './payments';
import { deliveryHandlers } from './delivery';
import { productHandlers } from './products';
import { calculatorHandlers } from './calculator';
import { clientHandlers } from './client';
import { generalHandlers } from './general';

// clientHandlers first: their public paths (orders/free-access/, …) would otherwise match orders/:id/
export const handlers = [
    ...clientHandlers,
    ...authHandlers,
    ...orderHandlers,
    ...customerHandlers,
    ...paymentHandlers,
    ...deliveryHandlers,
    ...productHandlers,
    ...calculatorHandlers,
    ...generalHandlers,
];
