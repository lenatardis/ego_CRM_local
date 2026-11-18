import { getFormattedDate } from "./getFormattedDate";
import { t } from '../i18n';

const numberEmoji = (num) => num.toString().split("").map(digit => `${digit}️⃣`).join("");

export const getOrderMessageText = (orderId, order, deliveryInfo, warehouseItems) => {
     let resultText = '';
    let count = 1;
    resultText += `📝 ${t('Замовлення №{{id}}', {id: orderId})}\n`;
    resultText += `📅 ${t('Дата замовлення:')} ${getFormattedDate(order.created)}\n`;
    resultText += '\n';
    if (deliveryInfo?.receiver?.address) {
        resultText += `📍 ${t('Адреса доставки:')} ${t('м.')} ${deliveryInfo.receiver.delivery_receiver.city}, ${deliveryInfo.receiver.address}\n`;
    }
    if (deliveryInfo?.delivery?.ttn) {
        resultText += `📦 ${t('ТТН')}: ${deliveryInfo.delivery.ttn}\n`;
    }
    resultText += '\n\n';
    resultText += `🛒 ${t('Список товарів:')}\n\n`;
    warehouseItems.forEach(item => {
        if (item.kit) {
            resultText += `${numberEmoji(count)} ${t('Кастомний комплект')}\n`;
            resultText += `${t('Код тканини')}: ${item.kit.fabric}\n`;
            resultText += `${t('Тип комплекту')}: ${item.kit.type}\n`;
            if (item.kit.component.length > 0) {
                resultText += `${t('Склад комплекту')}:\n`;
                resultText += '- ' + item.kit.component.map(component => component.name).join('\n- ')
                resultText += '\n';
            }
            if (item.kit.option.length > 0) {
                resultText += `${t('Додаткові опції:')}\n`;
                resultText += `- ` + item.kit.option.map(option => option.name).join('\n- ');
                resultText += '\n';
            }
            resultText += `${t('Ціна')}: ${item.kit.price} ${t('грн')}\n`;
        } else {
            resultText += `${numberEmoji(count)} ${item.warehouse_item.name}\n`;
            resultText += `${t('Тип')}: ${t('Товар зі складу')}\n`;
            resultText += `${t('Розмір')}: ${item.warehouse_item.size}\n`;
            resultText += `${t('Колір')}: ${item.warehouse_item.color}\n`;
            resultText += `${t('Ціна')}: ${item.warehouse_item.price} ${t('грн')}\n`;
        }
        resultText += '\n';
        count++;
    });
    resultText += '\n';
    if (order?.comment) {
        resultText += `💬 ${t('Коментар до замовлення:')}\n`;
        resultText += order.comment + '\n\n';
    }
    if (order?.payment) {
        if (order?.payment?.discount_amount) {
            const { discount_amount, discount_type, final_amount } = order.payment;
            const discountValue = discount_type === 'PERC' ? discount_amount + '%' : discount_amount + ' ' + t('грн');
            resultText += `💰 ${t('Ціна зі знижкою {{discount}} складає:', {discount: discountValue})} ${final_amount} ${t('грн')}\n`;
        } else {
            resultText += `💰 ${t('Ціна')}: ${order.payment.amount} ${t('грн')}\n`;
        }
    }
    resultText += `🔗 ${t('Посилання на замовлення:')}\n`;
    resultText += order.url;

    return resultText;
}