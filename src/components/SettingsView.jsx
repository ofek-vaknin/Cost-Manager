// SettingsView.jsx
// ------------------------------------------------------
// Allows the user to configure the URL for fetching exchange rates,
// test the connection, and reset to the default API.
// ------------------------------------------------------

import React, { useState } from 'react'
import { Box, Button, Stack, TextField, Typography, Paper } from '@mui/material'
import { fetchRates, setRatesURL, getRatesURL } from '../services/exchangeRates'

/**
 * SettingsView Component
 * ------------------------------------------------------
 * Provides controls for:
 * - Setting a custom exchange rates API
 * - Testing the connection
 * - Resetting to the default API
 *
 * @returns {JSX.Element} - The settings view component.
 */
export default function SettingsView() {

    /* ---------------- State ---------------- */
    // Current URL for exchange rates
    const [url, setUrl] = useState(getRatesURL())
    // Exchange rates data
    const [rates, setRates] = useState(null)
    // Error state
    const [error, setError] = useState(null)

    /**
     * handleSave
     * ------------------------------------------------------
     * Saves the URL in localStorage and attempts to fetch the rates.
     * If successful, updates the rates state; otherwise sets error.
     *
     * @returns {Promise<void>}
     */
    const handleSave = async () => {
        try {
            // Save new URL in localStorage
            setRatesURL(url)
            // Try to fetch rates
            const data = await fetchRates()
            // Update state with fetched rates
            setRates(data)
            // Clear error
            setError(null)
        } catch (err) {
            if (err.message.includes('Invalid exchange rates JSON structure')) {
                setError(
                    'The API you provided returned an unsupported format. ' +
                    'Please use a valid URL that provides rates in JSON format ' +
                    'with USD, GBP, EURO and ILS.'
                )
            } else {
                setError(err.message || 'Failed to fetch rates. Please check the URL.')
            }
            setRates(null)
        }
    }

    /**
     * handleReset
     * ------------------------------------------------------
     * Removes the custom URL from localStorage and reloads the default API.
     *
     * @returns {Promise<void>}
     */
    const handleReset = async () => {
        // Delete custom URL
        localStorage.removeItem("ratesURL")
        // Will fallback to default API
        const defaultUrl = getRatesURL()
        // Update input field
        setUrl(defaultUrl)

        try {
            // Fetch default API
            const data = await fetchRates()
            setRates(data)
            setError(null)
        } catch (err) {
            setError(err.message || "Failed to load default API")
            setRates(null)
        }
    }

    /* ---------------- Render ---------------- */
    return (
        <Paper sx={{ p: 3 }}>
            <Stack spacing={2}>
                <Typography variant="h5">Settings</Typography>

                {/* Input field for exchange rates URL */}
                <TextField
                    label="Exchange Rates URL"
                    fullWidth
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                />

                {/* Action buttons */}
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button variant="contained" color="primary" onClick={handleSave}>
                        Test & Save
                    </Button>
                    <Button variant="contained" color="primary" onClick={handleReset}>
                        Reset to Default API
                    </Button>
                </Box>

                {/* Show error if exists */}
                {error && (
                    <Typography color="error" sx={{ whiteSpace: 'pre-line' }}>
                        {error}
                    </Typography>
                )}

                {/* Show current rates if valid */}
                {rates && (
                    <Box>
                        <Typography variant="body2">Current rates:</Typography>
                        <pre>{JSON.stringify(rates, null, 2)}</pre>
                    </Box>
                )}
            </Stack>
        </Paper>
    )
}
