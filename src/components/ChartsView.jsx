// ChartsView.jsx
// ---------------------------------------------------------
// Displays filters (year, month, currency) and renders
// two charts: Pie (by category) and Bar (by month).
// Charts automatically refresh when the IndexedDB changes.
// ---------------------------------------------------------

import React, { useState, useEffect } from "react";
import {
    Typography,
    Paper,
    Box,
    Stack,
    TextField,
    MenuItem,
    Button
} from "@mui/material";
import PieByCategory from "./Charts/PieByCategory.jsx";
import BarByMonth from "./Charts/BarByMonth.jsx";
import {
    getPieData,
    getBarData,
    subscribeToChanges
} from "../services/idb.module.js";

// ---------- Constants ----------

// Generate a list of years (3 back + 4 ahead)
const YEARS = (() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 8 }, (_, i) => currentYear - 3 + i);
})();

// List of months (1–12)
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

// Supported currencies
const CURRENCIES = ["USD", "ILS", "GBP", "EURO"];

/**
 * ChartsView Component
 * ---------------------------------------------------------
 * Shows filters for year, month, and currency.
 * Displays:
 *   - Pie chart: total costs grouped by category.
 *   - Bar chart: total costs per month.
 * Automatically refreshes when new data is added to IndexedDB.
 */
export default function ChartsView() {
    /* ---------------- State ---------------- */
    const [year, setYear] = useState(new Date().getFullYear());
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [currency, setCurrency] = useState("USD");

    const [pieData, setPieData] = useState([]);
    const [barData, setBarData] = useState([]);

    /**
     * loadCharts
     * ---------------------------------------------------------
     * Fetches new Pie and Bar data from IndexedDB
     * based on the selected filters (year, month, currency).
     */
    async function loadCharts() {
        const pie = await getPieData(year, month, currency);
        const bar = await getBarData(year, currency);
        setPieData(pie);
        setBarData(bar);
    }

    /**
     * useEffect - Lifecycle hook
     * ---------------------------------------------------------
     * Runs when the component mounts or when the filters change.
     * Also subscribes to database changes for real-time updates.
     */
    useEffect(() => {
        // 1️⃣ Load initial data when component mounts or filters change
        loadCharts();

        // 2️⃣ Subscribe to changes in IndexedDB
        const unsubscribe = subscribeToChanges(() => {
            console.log("🔁 Database changed – refreshing charts...");
            loadCharts();
        });

        // 3️⃣ Cleanup: remove listener when component unmounts
        return unsubscribe;
    }, [year, month, currency]);

    /* ---------------- JSX ---------------- */
    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                Charts Overview
            </Typography>

            {/* ---------- Filters Section ---------- */}
            <Paper sx={{ p: 2 }}>
                <Stack
                    direction={{ xs: "column", md: "row" }}
                    spacing={2}
                    alignItems="center"
                >
                    {/* Year filter */}
                    <TextField
                        label="Year"
                        select
                        value={year}
                        onChange={(e) => setYear(Number(e.target.value))}
                        sx={{ minWidth: 120 }}
                    >
                        {YEARS.map((y) => (
                            <MenuItem key={y} value={y}>
                                {y}
                            </MenuItem>
                        ))}
                    </TextField>

                    {/* Month filter */}
                    <TextField
                        label="Month"
                        select
                        value={month}
                        onChange={(e) => setMonth(Number(e.target.value))}
                        sx={{ minWidth: 120 }}
                    >
                        {MONTHS.map((m) => (
                            <MenuItem key={m} value={m}>
                                {m}
                            </MenuItem>
                        ))}
                    </TextField>

                    {/* Currency filter */}
                    <TextField
                        label="Currency"
                        select
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        sx={{ minWidth: 140 }}
                    >
                        {CURRENCIES.map((c) => (
                            <MenuItem key={c} value={c}>
                                {c}
                            </MenuItem>
                        ))}
                    </TextField>

                    {/* Manual refresh button (optional) */}
                    <Button
                        variant="contained"
                        onClick={loadCharts}
                        sx={{ fontWeight: "bold" }}
                    >
                        Run Report
                    </Button>
                </Stack>
            </Paper>

            {/* ---------- Charts Section ---------- */}
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                {/* Pie chart */}
                <Paper sx={{ flex: 1, minWidth: 500, p: 3, height: 500 }}>
                    <Typography variant="subtitle1" gutterBottom>
                        By Category ({currency})
                    </Typography>
                    <PieByCategory data={pieData} currency={currency} />
                </Paper>

                {/* Bar chart */}
                <Paper sx={{ flex: 1, minWidth: 500, p: 3, height: 500 }}>
                    <Typography variant="subtitle1" gutterBottom>
                        By Month ({currency})
                    </Typography>
                    <BarByMonth data={barData} currency={currency} />
                </Paper>
            </Box>
        </Box>
    );
}
