// src/App.jsx
// ------------------------------------------------------
// Main Application Component
// ------------------------------------------------------
// Manages navigation between all app views:
//   - Add new cost
//   - Report generation
//   - Charts visualization
//   - Settings configuration
// ------------------------------------------------------

import React, { useState } from "react";
import {
    AppBar,
    Box,
    Button,
    Container,
    Stack,
    Toolbar,
    Typography,
} from "@mui/material";
import AddCostForm from "./components/AddCostForm.jsx";
import ReportView from "./components/ReportView.jsx";
import ChartsView from "./components/ChartsView.jsx";
import SettingsView from "./components/SettingsView.jsx";

/**
 * App
 * ----
 * Root component of the application.
 * Holds state for current view, report data, and error handling.
 *
 * @returns {JSX.Element} - The rendered application
 */
export default function App() {
    /* Current active view */
    const [view, setView] = useState("add");

    /* Last generated report */
    const [report, setReport] = useState(null);

    /* Error state for report view */
    const [error, setError] = useState("");

    /**
     * Render the selected view based on current state.
     *
     * @returns {JSX.Element} - One of AddCostForm, ReportView, ChartsView, or SettingsView
     */
    const renderView = () => {
        switch (view) {
            case "add":
                return <AddCostForm />;
            case "report":
                return (
                    <ReportView
                        report={report}
                        setReport={setReport}
                        error={error}
                        setError={setError}
                    />
                );
            case "charts":
                return <ChartsView report={report} />;
            case "settings":
                return <SettingsView />;
            default:
                return <AddCostForm />;
        }
    };

    // ---------- Render ----------
    return (
        <Box sx={{ minHeight: "100vh", bgcolor: "#f5f7fa" }}>
            {/* Application header with navigation */}
            <AppBar position="static" sx={{ bgcolor: "#4caf50" }}>
                <Toolbar>
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                        Cost Manager
                    </Typography>
                    <Stack direction="row" spacing={2}>
                        {/* Navigation buttons */}
                        <Button color="inherit" onClick={() => setView("add")}>
                            Add
                        </Button>
                        <Button color="inherit" onClick={() => setView("report")}>
                            Report
                        </Button>
                        <Button color="inherit" onClick={() => setView("charts")}>
                            Charts
                        </Button>
                        <Button color="inherit" onClick={() => setView("settings")}>
                            Settings
                        </Button>
                    </Stack>
                </Toolbar>
            </AppBar>

            {/* Main content container */}
            <Container maxWidth="lg" sx={{ py: 4 }}>
                {renderView()}
            </Container>

            {/* Footer */}
            <Box
                component="footer"
                sx={{
                    py: 3,
                    textAlign: "center",
                    bgcolor: "#e8f5e9",
                    mt: 4,
                }}
            >
                <Typography variant="body2">
                    Cost Manager © {new Date().getFullYear()}
                </Typography>
            </Box>
        </Box>
    );
}
