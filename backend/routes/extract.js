/**
 * Reader Mode Backend Server
 * routes/extract.js - Routes for content extraction
 */

const express = require('express');
const router = express.Router();
const { extractContent } = require('../services/gemini');
const https = require('https');
const http = require('http');

/**
 * Fetch HTML content from a URL
 * @param {string} url - The URL to fetch
 * @returns {Promise<string>} - The HTML content
 */
async function fetchHtmlContent(url) {
  return new Promise((resolve, reject) => {
    // Determine if we need http or https
    const client = url.startsWith('https') ? https : http;
    
    const request = client.get(url, (response) => {
      // Handle redirects
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        return resolve(fetchHtmlContent(response.headers.location));
      }

      // Check for successful response
      if (response.statusCode !== 200) {
        return reject(new Error(`Failed to fetch URL: ${response.statusCode}`));
      }

      // Get the response data
      let data = '';
      response.on('data', (chunk) => {
        data += chunk;
      });
      
      response.on('end', () => {
        resolve(data);
      });
    });

    request.on('error', (err) => {
      reject(err);
    });

    // Set a timeout of 10 seconds
    request.setTimeout(10000, () => {
      request.abort();
      reject(new Error('Request timeout'));
    });
  });
}

/**
 * POST /extract
 * Extract the main content from a webpage
 */
router.post('/', async (req, res) => {
  try {
    const { url, html } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: true, message: 'URL is required' });
    }

    // If HTML content is provided, use it directly
    // Otherwise, fetch the HTML content from the URL
    let htmlContent;
    if (html) {
      htmlContent = html;
    } else {
      try {
        htmlContent = await fetchHtmlContent(url);
      } catch (error) {
        return res.status(400).json({ 
          error: true, 
          message: `Failed to fetch URL: ${error.message}` 
        });
      }
    }

    // Extract the content using Gemini
    const extractedContent = await extractContent(url, htmlContent);
    
    // Return the extracted content
    res.json({
      url,
      title: extractedContent.title,
      content: extractedContent.content
    });
  } catch (error) {
    console.error('Error in extract route:', error);
    res.status(500).json({ 
      error: true, 
      message: error.message || 'An error occurred during content extraction' 
    });
  }
});

module.exports = router;
