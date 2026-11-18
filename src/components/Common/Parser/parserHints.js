export const ORDER_PARSER_HINT = `Правила заповнення даних:

Введений рядок автоматично розбивається на значення у такому порядку:
1) Перше значення – ім’я
2) Друге значення – по батькові
3) Третє значення – прізвище
4) Четверте значення – номер телефону

Значення мають бути розділені пробілом.

Приклади:
* Іван Іванович Петренко 0991234567
→ Ім’я: Іван
→ По батькові: Іванович
→ Прізвище: Петренко
→ Телефон: 0991234567

* Олена Сергіївна Коваль 0509876543
→ Ім’я: Олена
→ По батькові: Сергіївна
→ Прізвище: Коваль
→ Телефон: 0509876543

* Петро Олексійович Бондар 0671112233
→ Ім’я: Петро
→ По батькові: Олексійович
→ Прізвище: Бондар
→ Телефон: 0671112233

Зверніть увагу! Порядок значень є важливим. Якщо якесь значення відсутнє – відповідне поле залишиться порожнім або може бути заповнене некоректно.`;

export const DELIVERY_PARSER_HINT = `Правила заповнення даних:

Введений рядок автоматично розбивається на значення у такому порядку:
1) Перше значення – ім’я
2) Друге значення – по батькові
3) Третє значення – прізвище
4) Четверте значення – номер телефону
5) П'яте значення – місто, село чи інший населений пункт

Значення мають бути розділені пробілом.

Приклади:
* Іван Іванович Петренко 0991234567 м. Київ
→ Ім’я: Іван
→ По батькові: Іванович
→ Прізвище: Петренко
→ Телефон: 0991234567
→ Місто: Київ

* Олена Сергіївна Коваль 0509876543 Черкаси
→ Ім’я: Олена
→ По батькові: Сергіївна
→ Прізвище: Коваль
→ Телефон: 0509876543
→ Місто: Черкаси

* Петро Олексійович Бондар 0671112233 с. Масівці
→ Ім’я: Петро
→ По батькові: Олексійович
→ Прізвище: Бондар
→ Телефон: 0671112233
→ Місто: Масівці

Зверніть увагу! Порядок значень є важливим. Якщо якесь значення відсутнє – відповідне поле залишиться порожнім або може бути заповнене некоректно.`;
// Demo build (2026-11-18): English versions (src/i18n/en.js maps the texts above to these). The parser reads
// Ukrainian names, phones and places, so the examples stay Ukrainian.
export const ORDER_PARSER_HINT_EN = `How to enter the data:

The entered line is split into values in this order:
1) First value – first name
2) Second value – patronymic
3) Third value – last name
4) Fourth value – phone number

Separate the values with a space.

Examples:
* Іван Іванович Петренко 0991234567
→ First name: Іван
→ Patronymic: Іванович
→ Last name: Петренко
→ Phone: 0991234567

* Олена Сергіївна Коваль 0509876543
→ First name: Олена
→ Patronymic: Сергіївна
→ Last name: Коваль
→ Phone: 0509876543

* Петро Олексійович Бондар 0671112233
→ First name: Петро
→ Patronymic: Олексійович
→ Last name: Бондар
→ Phone: 0671112233

Note: the order of the values matters. If a value is missing, its field stays empty or may be filled in wrongly.`;

export const DELIVERY_PARSER_HINT_EN = `How to enter the data:

The entered line is split into values in this order:
1) First value – first name
2) Second value – patronymic
3) Third value – last name
4) Fourth value – phone number
5) Fifth value – city, village or other locality

Separate the values with a space.

Examples:
* Іван Іванович Петренко 0991234567 м. Київ
→ First name: Іван
→ Patronymic: Іванович
→ Last name: Петренко
→ Phone: 0991234567
→ City: Київ

* Олена Сергіївна Коваль 0509876543 Черкаси
→ First name: Олена
→ Patronymic: Сергіївна
→ Last name: Коваль
→ Phone: 0509876543
→ City: Черкаси

* Петро Олексійович Бондар 0671112233 с. Масівці
→ First name: Петро
→ Patronymic: Олексійович
→ Last name: Бондар
→ Phone: 0671112233
→ City: Масівці

Note: the order of the values matters. If a value is missing, its field stays empty or may be filled in wrongly.`;
