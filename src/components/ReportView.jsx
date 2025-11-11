// ReportView.jsx
// ------------------------------------------------------
// Main report view: allows the user to generate and display reports.
// Stores last generated report in localStorage for persistence.
// ------------------------------------------------------

import React, { useEffect } from 'react';
import { Stack, Typography, Paper, Alert } from '@mui/material';
import CostList from './CostList.jsx';
import ReportControls from './ReportControls.jsx';
import { getReport } from '../services/idb.module.js';

/**
 * ReportView Component
 * ------------------------------------------------------
 * Displays the report controls (year/month/currency) and the results table.
 *
 * @param {Object}   report    - Current report object (from parent state).
 * @param {Function} setReport - Setter function for updating report state.
 * @param {string}   error     - Error message if report building failed.
 * @param {Function} setError  - Setter function for updating error state.
 * @returns {JSX.Element} - The report view component.
 */
// Destructuring Object
export default function ReportView({ report, setReport, error, setError }) {

    /* ---------------- Load last report from localStorage ---------------- */
    useEffect(() => {
        if (!report) {
            const saved = localStorage.getItem('lastReport');
            if (saved) {
                try {
                    setReport(JSON.parse(saved));
                } catch {
                    // Ignore JSON parse error
                }
            }
        }
    }, [report, setReport]);

    /* ---------------- Handle "Get Report" button ---------------- */
    const handleReport = async ({ year, month, currency }) => {
        setError?.('');
        try {
            // Fetch report
            const rep = await getReport(year, month, currency);

            // Save in state
            setReport(rep);

            // Persist to localStorage
            localStorage.setItem('lastReport', JSON.stringify(rep));
        } catch (e) {
            setError?.(e.message || 'Failed to build report');
        }
    };

    /* ---------------- Render ---------------- */
    return (
        <Stack spacing={3}>
            <Typography variant="h5">Report</Typography>

            {/* Report controls (year/month/currency) */}
            <Paper sx={{ p: 4 }}>
                <ReportControls onRun={handleReport} /> {/*we send prop to the ReportControls component that we want to run the handleReport function when the user clicks on the button*/}
            </Paper>

            {/* Error alert if exists */}
            {error && <Alert severity="error">{error}</Alert>}

            {/* Report results table */}
            {report && (
                <CostList
                    items={report.costs}
                    reportCurrency={report.currency}
                    total={report.total}
                />
            )}
        </Stack>
    );
}
