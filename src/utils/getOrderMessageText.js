import { getFormattedDate } from "./getFormattedDate";

const numberEmoji = (num) => num.toString().split("").map(digit => `${digit}️⃣`).join("");

export const getOrderMessageText = (orderId, order, deliveryInfo, warehouseItems) => {
     let resultText = '';
    let count = 1;
    resultText += `📝 Замовлення №${orderId}\n`;
    resultText += `📅 Дата замовлення: ${getFormattedDate(order.created)}\n`;
    resultText += '\n';
    if (deliveryInfo?.receiver?.address) {
        resultText += `📍 Адреса доставки: м. ${deliveryInfo.receiver.delivery_receiver.city}, ${deliveryInfo.receiver.address}\n`;
    }
    if (deliveryInfo?.delivery?.ttn) {
        resultText += `📦 ТТН: ${deliveryInfo.delivery.ttn}\n`;
    }
    resultText += '\n\n';
    resultText += '🛒 Список товарів:\n\n';
    warehouseItems.forEach(item => {
        if (item.kit) {
            resultText += `${numberEmoji(count)} Кастомний комплект\n`;
            resultText += `Код тканини: ${item.kit.fabric}\n`;
            resultText += `Тип комплекту: ${item.kit.type}\n`;
            if (item.kit.component.length > 0) {
                resultText += `Склад комплекту:\n`;
                resultText += '- ' + item.kit.component.map(component => component.name).join('\n- ')
                resultText += '\n';
            }
            if (item.kit.option.length > 0) {
                resultText += `Додаткові опції:\n`;
                resultText += `- ` + item.kit.option.map(option => option.name).join('\n- ');
                resultText += '\n';
            }
            resultText += `Ціна: ${item.kit.price} грн\n`;
        } else {
            resultText += `${numberEmoji(count)} ${item.warehouse_item.name}\n`;
            resultText += `Тип: Товар зі складу\n`;
            resultText += `Розмір: ${item.warehouse_item.size}\n`;
            resultText += `Колір: ${item.warehouse_item.color}\n`;
            resultText += `Ціна: ${item.warehouse_item.price} грн\n`;
        }
        resultText += '\n';
        count++;
    });
    resultText += '\n';
    if (order?.comment) {
        resultText += '💬 Коментар до замовлення:\n';
        resultText += order.comment + '\n\n';
    }
    if (order?.payment) {
        if (order?.payment?.discount_amount) {
            const { discount_amount, discount_type, final_amount } = order.payment;
            const discountValue = discount_type === 'PERC' ? discount_amount + '%' : discount_amount + ' грн';
            resultText += `💰 Ціна зі знижкою ${discountValue} складає: ${final_amount} грн\n`;
        } else {
            resultText += `💰 Ціна: ${order.payment.amount} грн\n`;
        }
    }
    resultText += '🔗 Посилання на замовлення:\n';
    resultText += order.url;

    return resultText;
}