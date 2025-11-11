// AddCostForm.jsx
// ----------------------------------------------------
// Controlled form component for adding a new cost item.
// Performs validation and stores the data in IndexedDB
// using addCost() from idb.module.js.
// Charts and reports will auto-refresh via subscribeToChanges.
// ----------------------------------------------------

import React, { useState } from "react";
import {
    Box,
    Button,
    Card,
    CardContent,
    MenuItem,
    Stack,
    TextField,
    Typography,
    Snackbar,
    Alert,
} from "@mui/material";
import { addCost } from "../services/idb.module.js";

// ---------------- Constants ----------------

// Supported currencies
const CURRENCIES = ["USD", "ILS", "GBP", "EURO"];

// Supported categories
const CATEGORIES = [
    "Food",
    "Car",
    "Education",
    "Home",
    "Health",
    "Leisure",
    "Other",
];

// Initial empty form state
const INITIAL_FORM_STATE = {
    sum: "",
    currency: "USD",
    category: "Food",
    description: "",
};

/**
 * validateForm
 * ----------------------------------------------------
 * Validates user inputs before saving.
 * Returns an error message if invalid, or an empty string if valid.
 */
function validateForm(form) {
    const numericSum = Number(form.sum);

    if (!form.sum || Number.isNaN(numericSum) || numericSum <= 0) {
        return "Sum must be a positive number";
    }
    if (!form.description.trim()) {
        return "Description is required";
    }
    return ""; // valid form
}

/**
 * AddCostForm Component
 * ----------------------------------------------------
 * Displays a form for adding new cost entries.
 * Saves to IndexedDB and triggers automatic chart refresh
 * through the notifyChange() mechanism.
 */
export default function AddCostForm() {
    // ---------------- State variables ----------------
    const [form, setForm] = useState(INITIAL_FORM_STATE);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [success, setSuccess] = useState(false);

    /**
     * handleChange
     * ----------------------------------------------------
     * Updates form fields as the user types or selects options.
     */
    function handleChange(event) {
        const fieldName = event.target.name;
        const fieldValue = event.target.value;

        // Create a copy of the current form - we can not change the state directly
        const updatedForm = {
            sum: form.sum,
            currency: form.currency,
            category: form.category,
            description: form.description,
        };

        // Update only the changed field
        updatedForm[fieldName] = fieldValue;

        // Save back into React state
        setForm(updatedForm);
    }

    /**
     * handleSubmit
     * ----------------------------------------------------
     * Validates input and saves the cost into IndexedDB.
     * On success, form resets and a success message appears.
     */
    async function handleSubmit(event) {
        event.preventDefault(); // Prevent page refresh
        setErrorMessage(""); // Clear previous error

        // Validate fields
        const validationError = validateForm(form);
        if (validationError) {
            setErrorMessage(validationError);
            return;
        }

        setLoading(true);

        try {
            // Save the new cost item in IndexedDB
            await addCost({
                sum: Number(form.sum),
                currency: form.currency,
                category: form.category,
                description: form.description.trim(),
            });

            // Reset form after successful save
            setForm(INITIAL_FORM_STATE);

            // Show success notification
            setSuccess(true);
        } catch (error) {
            console.error("Error adding cost:", error);
            setErrorMessage("Failed to add cost, please try again.");
        } finally {
            setLoading(false);
        }
    }

    // ---------------- JSX (UI) ----------------
    return (
        <Card>
            <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
                    Add New Cost
                </Typography>

                {/* Form Section */}
                <Box component="form" onSubmit={handleSubmit}>
                    <Stack direction="row" spacing={3} >
                        {/* Sum input */}
                        <TextField
                            label="Sum"
                            name="sum"
                            type="number"
                            fullWidth
                            value={form.sum}
                            onChange={handleChange}
                            required
                        />

                        {/* Currency selector */}
                        <TextField
                            label="Currency"
                            name="currency"
                            select
                            fullWidth
                            value={form.currency}
                            onChange={handleChange}
                        >
                            {CURRENCIES.map((currency) => (
                                <MenuItem key={currency} value={currency}>
                                    {currency}
                                </MenuItem>
                            ))}
                        </TextField>

                        {/* Category selector */}
                        <TextField
                            label="Category"
                            name="category"
                            select
                            fullWidth
                            value={form.category}
                            onChange={handleChange}
                        >
                            {CATEGORIES.map((category) => (
                                <MenuItem key={category} value={category}>
                                    {category}
                                </MenuItem>
                            ))}
                        </TextField>

                        {/* Description input */}
                        <TextField
                            label="Description"
                            name="description"
                            fullWidth
                            value={form.description}
                            onChange={handleChange}
                            required
                        />
                    </Stack>

                    {/* Submit button */}
                    <Box sx={{ mt: 2 }}>
                        <Button
                            variant="contained"
                            color="primary"
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? "Saving..." : "Add Cost"}
                        </Button>
                    </Box>
                </Box>

                {/* Error message */}
                {errorMessage && (
                    <Typography color="error" sx={{ mt: 2 }}>
                        {errorMessage}
                    </Typography>
                )}

                {/* Success Snackbar */}
                <Snackbar
                    open={success}
                    autoHideDuration={3000}
                    onClose={() => setSuccess(false)}
                >
                    <Alert
                        onClose={() => setSuccess(false)}
                        severity="success"
                        sx={{ width: "100%" }}
                    >
                        Cost added successfully!
                    </Alert>
                </Snackbar>
            </CardContent>
        </Card>
    );
}
