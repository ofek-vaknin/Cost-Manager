// src/services/idb.module.js
// ------------------------------------------------------
// IndexedDB Service Module
// ------------------------------------------------------
// Provides all database-related operations for the Costs app.
// Includes:
//   - Opening the DB
//   - Adding cost items
//   - Generating reports
//   - Aggregating data for charts (Pie, Bar)
// ------------------------------------------------------

import { fetchRates } from "./exchangeRates";
import { convert } from "./currency";

// ---------- Constants ----------
/* Default DB name */
const DB_NAME = "costsdb";
/* Object store name */
const STORE_NAME = "costs";

// ---------- Subscribers ----------
const listeners = new Set();

/**
 * Subscribe to DB change notifications.
 * Useful for updating charts when new data is added.
 *
 * @param {Function} listener - Callback to invoke on DB change.
 * @returns {Function} - Unsubscribe function.
 */
export function subscribeToChanges(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

/**
 * Notify all registered listeners about a DB change.
 */
function notifyChange() {
    listeners.forEach((l) => l());
}

// ---------- Open DB ----------
/**
 * Open IndexedDB and return a Promise with the DB object.
 *
 * @param {string} [databaseName=DB_NAME] - Database name.
 * @param {number} [databaseVersion=1] - Database version.
 * @returns {Promise<IDBDatabase>} - A Promise resolving with the DB instance.
 */
export function openCostsDB(databaseName = DB_NAME, databaseVersion = 1) {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(databaseName, databaseVersion);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                const store = db.createObjectStore(STORE_NAME, {
                    keyPath: "id",
                    autoIncrement: true,
                });
                store.createIndex("year", "date.year", { unique: false });
                store.createIndex("month", "date.month", { unique: false });
            }
        };

        request.onsuccess = (event) => resolve(event.target.result);
        request.onerror = (event) => reject(event.target.error);
    });
}

// ---------- Add Cost ----------
/**
 * Add a new cost item into IndexedDB.
 *
 * @param {Object} cost - The cost item to insert.
 * @param {number} cost.sum - Amount of the cost.
 * @param {string} cost.currency - Currency code (USD, ILS, GBP, EURO).
 * @param {string} cost.category - Category of the expense.
 * @param {string} cost.description - Description of the expense.
 * @returns {Promise<Object>} - Resolves with the inserted cost object.
 */
export async function addCost(cost) {
    const db = await openCostsDB();// open the database from the fun we crated before
    const tx = db.transaction(STORE_NAME, "readwrite"); //
    const store = tx.objectStore(STORE_NAME);

    const now = new Date();
    const item = {
        sum: cost.sum,
        currency: cost.currency,
        category: cost.category,
        description: cost.description,
        date: {
            year: now.getFullYear(),
            month: now.getMonth() + 1,
            day: now.getDate(),
        },
    };

    return new Promise((resolve, reject) => {
        const req = store.add(item); //we ask the store to add the item
        req.onsuccess = () => {
            // Trigger subscribers
            notifyChange();
            resolve(item); //the add function returns the item we added
        };
        req.onerror = (e) => reject(e.target.error);
    });
}

// ---------- Get Report ----------
/**
 * Build a detailed report for a specific year/month and currency.
 * Costs remain original, only the total is converted.
 *
 * @param {number} year - Report year.
 * @param {number} month - Report month.
 * @param {string} currency - Target currency for the total.
 * @returns {Promise<Object>} - Report object:
 *   { year, month, costs: [...], total: { currency, total } }
 */
export async function getReport(year, month, currency) {
    const rates = await fetchRates(); // fun that fetches the rates from the api
    const db = await openCostsDB();
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);

    const costs = [];
    let total = 0;

    return new Promise((resolve, reject) => {
        const req = store.openCursor();
        req.onsuccess = (event) => { // each time we succeed to get a cursor we get the item
            const cursor = event.target.result;
            if (cursor) {
                const item = cursor.value;
                if (item.date.year === year && item.date.month === month) {
                    // Keep original cost
                    costs.push(item);
                    // Convert only total
                    total += convert(item.sum, item.currency, currency, rates);
                }
                cursor.continue();
            } else {
                resolve({
                    year,
                    month,
                    costs,
                    total: { currency, total },
                });
            }
        };
        req.onerror = (e) => reject(e.target.error);
    });
}

// ---------- Pie Data ----------
/**
 * Return aggregated costs per category for given month in chosen currency.
 *
 * @param {number} year - Target year.
 * @param {number} month - Target month.
 * @param {string} currency - Currency to convert values into.
 * @returns {Promise<Array<{name: string, value: number}>>}
 *   Array formatted for Recharts PieChart.
 */
export async function getPieData(year, month, currency) {
    const rates = await fetchRates();
    const db = await openCostsDB();
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);

    const grouped = {};

    return new Promise((resolve, reject) => {
        const req = store.openCursor();
        req.onsuccess = (event) => {
            const cursor = event.target.result;
            if (cursor) {
                const item = cursor.value;
                if (item.date.year === year && item.date.month === month) {
                    const converted = convert(item.sum, item.currency, currency, rates);
                    grouped[item.category] = (grouped[item.category] || 0) + converted; // grouped= { food:50}
                }
                cursor.continue();
            } else {
                resolve(
                    // we make an array of objects [{name:food, value:50}] for the pie chart
                    Object.entries(grouped).map(([name, value]) => ({
                        name,
                        value,
                    }))
                );
            }
        };
        req.onerror = (e) => reject(e.target.error);
    });
}

// ---------- Bar Data ----------
/**
 * Return totals for each month (1–12) in a given year.
 *
 * @param {number} year - Target year.
 * @param {string} currency - Currency to convert values into.
 * @returns {Promise<Array<{month: number, total: number}>>}
 *   Array formatted for Recharts BarChart.
 */
export async function getBarData(year, currency) {
    const rates = await fetchRates();
    const db = await openCostsDB();
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);

    const months = Array(12).fill(0);

    return new Promise((resolve, reject) => {
        const req = store.openCursor();
        req.onsuccess = (event) => {
            const cursor = event.target.result;
            if (cursor) {
                const item = cursor.value;
                if (item.date.year === year) {
                    const converted = convert(item.sum, item.currency, currency, rates);
                    months[item.date.month - 1] += converted;
                }
                cursor.continue();
            } else {
                resolve(months.map((total, idx) => ({ month: idx + 1, total })));
            }
        };
        req.onerror = (e) => reject(e.target.error);
    });
}
