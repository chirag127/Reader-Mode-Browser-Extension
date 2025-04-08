/**
 * Extract Content Routes
 * Handles API endpoints for content extraction
 */

const express = require('express');
const router = express.Router();
const { extractContent } = require('../controllers/extractContentController');

// POST endpoint to extract content from HTML
router.post('/extract', extractContent);

module.exports = {
  extractContentRoutes: router
};
