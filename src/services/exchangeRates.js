// src/services/exchangeRates.js
// ---------- Constants ----------
/**
 * Key used in localStorage to store the rates URL.
 */
const key = "ratesURL";

/**
 * Get the current URL for fetching exchange rates.
 * By default, it returns a real API endpoint:
 * https://api.exchangerate-api.com/v4/latest/USD
 *
 * @returns {string} - URL string
 */
export function getRatesURL() {
    return localStorage.getItem(key) || "https://api.exchangerate-api.com/v4/latest/USD";
}

/**
 * Save a new URL in localStorage for fetching exchange rates.
 *
 * @param {string} url - The new URL to save
 */
export function setRatesURL(url) {
    localStorage.setItem(key, url);
}

/**
 * Fetch currency exchange rates from the configured URL.
 * Supports both:
 *   - APIs like exchangerate-api.com that return { rates: {...} }
 *   - Simple JSON with direct rates like { USD:1, GBP:1.8, EURO:0.7, ILS:3.4 }
 *
 * Normalizes the response to the following structure:
 *   { USD: number, GBP: number, EURO: number, ILS: number }
 *
 * @returns {Promise<Object>} - A normalized map of exchange rates
 * @throws {Error} if the fetch fails or the structure is invalid
 */
export async function fetchRates() {
    const url = getRatesURL();
    const res = await fetch(url, { cache: "no-store" });

    if (!res.ok) {
        throw new Error(`Failed to fetch exchange rates from ${url}`);
    }

    const json = await res.json();

    // Handle APIs like exchangerate-api.com which return "rates"
    const source = json.rates ? json.rates : json;

    // Normalize: accept either EURO or EUR
    const normalized = {
        USD: source.USD,
        GBP: source.GBP,
        EURO: source.EURO ?? source.EUR,
        ILS: source.ILS,
    };

    // Validation: ensure all required currencies exist
    const required = ["USD", "GBP", "EURO", "ILS"];
    for (const k of required) {
        if (typeof normalized[k] !== "number") {
            throw new Error("Invalid exchange rates JSON structure.");
        }
    }

    return normalized;
}
