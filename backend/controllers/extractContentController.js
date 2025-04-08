/**
 * Extract Content Controller
 * Handles the logic for content extraction using Gemini
 */

const { extractWithGemini } = require('../services/geminiService');

/**
 * Extract content from HTML using Gemini
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const extractContent = async (req, res, next) => {
  try {
    const { html, url, title } = req.body;

    if (!html) {
      return res.status(400).json({
        error: {
          message: 'HTML content is required',
          status: 400
        }
      });
    }

    // Extract content using Gemini
    const extractedContent = await extractWithGemini(html, url, title);

    // Return the extracted content
    return res.status(200).json({
      success: true,
      article: extractedContent
    });
  } catch (error) {
    console.error('Error extracting content:', error);
    next(error);
  }
};

module.exports = {
  extractContent
};
