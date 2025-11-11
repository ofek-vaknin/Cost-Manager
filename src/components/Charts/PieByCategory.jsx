// PieByCategory.jsx
// ----------------------------
// Displays a pie chart of total costs grouped by categories
// for a given month and selected currency.
// ----------------------------

import React from "react";
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    ResponsiveContainer
} from "recharts";

// Colors for pie slices (rotating through palette)
const COLORS = [
    "#1976d2",
    "#9c27b0",
    "#ff9800",
    "#4caf50",
    "#f44336",
    "#009688",
    "#795548"
];

/**
 * PieByCategory Component
 * ----------------------------
 * Renders a pie chart of expenses grouped by category.
 * If no data is provided, a simple message is shown.
 *
 * @param {Array} data - Array of category totals [{name, value}]
 * @param {string} currency - The currency to display in labels and tooltips
 * @returns {JSX.Element} - Responsive pie chart
 */
export default function PieByCategory({ data, currency }) {
    // If there is no data, show fallback message
    if (!data || data.length === 0) {
        return <p>No data for pie chart</p>;
    }

    return (
        <ResponsiveContainer width="120%" height={400}>
            <PieChart>
                <Pie
                    data={data}
                    // Horizontal center
                    cx="47%"
                    // Vertical center
                    cy="50%"
                    // Size of pie
                    outerRadius={100}
                    // Use "value" field for slices
                    dataKey="value"
                    // Label shows category name + formatted value
                    label={({ name, value }) =>
                        `${name}: ${value.toFixed(2)} ${currency}`
                    }
                >
                    {/* Apply a unique color to each slice */}
                    {data.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                </Pie>

                {/* Tooltip shows formatted value with currency */}
                <Tooltip formatter={(v) => `${Number(v).toFixed(2)} ${currency}`} />

                {/* Legend for categories */}
                <Legend
                    verticalAlign="bottom"
                    align="left"
                    wrapperStyle={{ marginLeft: 40 }}
                />
            </PieChart>
        </ResponsiveContainer>
    );
}
