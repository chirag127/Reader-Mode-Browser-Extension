/**
 * Reader Mode Backend Server
 * services/gemini.js - Service for interacting with Google's Gemini 2.0 Flash Lite API
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize the Google Generative AI client
const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

// Use Gemini 2.0 Flash Lite model for fast content extraction
const MODEL_NAME = 'gemini-2.0-flash-lite';

/**
 * Extract the main content from a webpage using Gemini 2.0 Flash Lite
 * @param {string} url - The URL of the webpage
 * @param {string} htmlContent - The HTML content of the webpage
 * @returns {Promise<Object>} - The extracted content with title and main text
 */
async function extractContent(url, htmlContent) {
  try {
    // Check if API key is configured
    if (!apiKey) {
      throw new Error('Gemini API key is not configured');
    }

    // Initialize the model
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    // Create the prompt for content extraction
    const prompt = `
    You are a specialized content extraction system designed to identify and extract the article content from webpages.

    TASK:
    Extract ONLY the article content from the provided HTML, ignoring navigation, sidebars, ads, footers, and other non-essential elements.

    URL: ${url}

    FORMAT YOUR RESPONSE AS JSON with these fields:
    {
      "title": "The article title",
      "content": "The full article content in proper Markdown format. Preserve all headings, lists, tables, and other formatting elements."
    }

    IMPORTANT GUIDELINES:
    - Focus ONLY on the article content
    - Convert the content to proper Markdown format
    - Use # for main headings, ## for subheadings, etc.
    - Preserve bullet points as - or * lists
    - Preserve numbered lists as 1., 2., etc.
    - Convert tables to Markdown table format
    - Include important images with ![Image](image_url) or just [IMAGE] if URL not available
    - Preserve code blocks with \`\`\` for inline code and triple backticks for code block
    - Preserve blockquotes with >
    - Exclude navigation menus, sidebars, ads, footers, and comments
    - If no clear article content is found, return {"title": "", "content": "No article content found"}
    - Exclude any disclaimers or notices about the content extraction process
    - exclude related articles, author information, and publication date


    HTML CONTENT:
    ${htmlContent.substring(0, 500000)} // Limit content to avoid token limits
    `;

    // Generate content using the model
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to extract JSON from Gemini response');
    }

    // Parse the JSON response
    const extractedContent = JSON.parse(jsonMatch[0]);

    return {
      title: extractedContent.title || '',
      content: extractedContent.content || 'No article content found'
    };
  } catch (error) {
    console.error('Error extracting content with Gemini:', error);
    throw new Error(`Gemini extraction failed: ${error.message}`);
  }
}

module.exports = {
  extractContent
};
