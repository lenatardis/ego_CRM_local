// One-off snapshot of the real Nova Poshta directory for the mock backend (src/mocks/data/npDirectory.json):
// the cities below with their refs, and all their branches ("Branch" category, cargo branches included;
// no parcel lockers). The demo never calls Nova Poshta at runtime — rerun this by hand to refresh the snapshot.
// Uses the public JSON API (no key needed for these Address methods).
// Usage: node scripts/fetch-np-directory.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const API = 'https://api.novaposhta.ua/v2.0/json/';
const OUT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../src/mocks/data/npDirectory.json');

// [city, area] — the city as Nova Poshta names it, the area to tell same-named settlements apart
const CITIES = [
    ['Київ', 'Київська'], ['Харків', 'Харківська'], ['Одеса', 'Одеська'], ['Дніпро', 'Дніпропетровська'],
    ['Львів', 'Львівська'], ['Запоріжжя', 'Запорізька'], ['Вінниця', 'Вінницька'], ['Полтава', 'Полтавська'],
    ['Чернігів', 'Чернігівська'], ['Черкаси', 'Черкаська'], ['Житомир', 'Житомирська'], ['Суми', 'Сумська'],
    ['Хмельницький', 'Хмельницька'], ['Чернівці', 'Чернівецька'], ['Рівне', 'Рівненська'], ['Тернопіль', 'Тернопільська'],
    ['Івано-Франківськ', 'Івано-Франківська'], ['Луцьк', 'Волинська'], ['Ужгород', 'Закарпатська'],
    ['Кропивницький', 'Кіровоградська'], ['Миколаїв', 'Миколаївська'], ['Кривий Ріг', 'Дніпропетровська'],
    ['Біла Церква', 'Київська'], ['Кременчук', 'Полтавська'], ['Бровари', 'Київська'], ['Ірпінь', 'Київська'],
    ['Буча', 'Київська'], ['Мукачево', 'Закарпатська'], ['Умань', 'Черкаська'], ["Кам'янець-Подільський", 'Хмельницька'],
];

const norm = (s) => String(s).toLowerCase().replace(/[’`ʼ]/g, "'").trim();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const call = async (calledMethod, methodProperties) => {
    const response = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: '', modelName: 'Address', calledMethod, methodProperties }),
    });
    const data = await response.json();
    if (!data.success) throw new Error(`${calledMethod}: ${data.errors?.join(', ')}`);
    await sleep(300); // be gentle with the public API
    return data;
};

const cities = [];
const warehouses = [];

for (const [name, area] of CITIES) {
    const { data } = await call('getCities', { FindByString: name, Limit: '50' });
    const city = data.find((c) => norm(c.Description) === norm(name) && norm(c.AreaDescription) === norm(area))
        ?? data.find((c) => norm(c.Description) === norm(name));
    if (!city) throw new Error(`city not found: ${name}`);
    cities.push({
        city: city.Description,
        city_ref: city.Ref,
        area: city.AreaDescription,
        settlement_type: city.SettlementTypeDescription,
    });

    let page = 1;
    let branches = 0;
    for (;;) {
        const result = await call('getWarehouses', { CityRef: city.Ref, Limit: '500', Page: String(page) });
        result.data
            .filter((w) => w.CategoryOfWarehouse === 'Branch' && w.WarehouseStatus === 'Working')
            .forEach((w) => {
                branches += 1;
                warehouses.push({
                    address: w.Description,
                    address_ref: w.Ref,
                    city_ref: city.Ref,
                    index: w.PostalCodeUA || '',
                    // 0 means "no limit" in the directory
                    max_weight_allowed: Number(w.PlaceMaxWeightAllowed) || null,
                    max_weight_allowed_place: Number(w.PlaceMaxWeightAllowed) || null,
                    max_weight_allowed_total: Number(w.TotalMaxWeightAllowed) || null,
                    number: w.Number,
                });
            });
        if (page * 500 >= Number(result.info?.totalCount || 0)) break;
        page += 1;
    }
    console.log(`${city.Description}: ${branches} branches`);
}

warehouses.sort((a, b) => a.city_ref.localeCompare(b.city_ref) || Number(a.number) - Number(b.number));
fs.writeFileSync(OUT, `${JSON.stringify({ fetched: new Date().toISOString().slice(0, 10), cities, warehouses })}\n`);
console.log(`${cities.length} cities, ${warehouses.length} branches -> ${path.relative(process.cwd(), OUT)} (${fs.statSync(OUT).size} bytes)`);
