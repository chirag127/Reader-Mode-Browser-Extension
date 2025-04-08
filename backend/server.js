/**
 * Reader Mode Backend Server
 * server.js - Main entry point for the Express.js backend
 */

// Load environment variables
require("dotenv").config();

// Import dependencies
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const extractRoutes = require("./routes/extract");

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Configure CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",")
    : ["chrome-extension://", "moz-extension://", "edge-extension://"];

// Check if wildcard is included in allowed origins
const allowAllOrigins = allowedOrigins.includes("*");

app.use(
    cors({
        origin: function (origin, callback) {
            // Allow requests with no origin (like mobile apps, curl, etc.)
            if (!origin) return callback(null, true);

            // Allow all origins if wildcard is present
            if (allowAllOrigins) {
                return callback(null, true);
            }

            // Check if the origin starts with any of the allowed origins
            const isAllowed = allowedOrigins.some((allowedOrigin) =>
                origin.startsWith(allowedOrigin)
            );

            if (isAllowed) {
                return callback(null, true);
            } else {
                console.log(`CORS blocked origin: ${origin}`);
                const msg =
                    "The CORS policy for this site does not allow access from the specified origin.";
                return callback(new Error(msg), false);
            }
        },
        methods: ["GET", "POST"],
        credentials: true,
    })
);

// Middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// Routes
app.use("/extract", extractRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok", message: "Server is running" });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: true,
        message:
            process.env.NODE_ENV === "production"
                ? "An unexpected error occurred"
                : err.message,
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});

module.exports = app;
