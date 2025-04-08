/**
 * Gemini Service
 * Handles interaction with the Gemini 2.0 Flash Lite API
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize the Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

/**
 * Extract the main content from HTML using Gemini
 * @param {string} html - The HTML content to extract from
 * @param {string} url - The URL of the page
 * @param {string} title - The title of the page
 * @returns {Object} - The extracted article content
 */
const extractWithGemini = async (html, url, title) => {
  try {
    // Create a prompt for Gemini to extract the main content
    const prompt = `
    You are a content extraction expert. Extract the main article content from the following HTML.
    
    TASK:
    1. Identify and extract ONLY the main article content, title, and author (if available).
    2. Completely ignore and remove ads, navigation menus, footers, sidebars, and any other non-article content.
    3. Preserve important images that are part of the article content (provide their URLs).
    4. Maintain the original HTML structure for the main content only.
    5. Return the result as a JSON object with the following structure:
       {
         "title": "The article title",
         "byline": "Author name if available",
         "content": "The main article content in HTML format",
         "textContent": "The main article content in plain text format",
         "siteName": "The name of the website if available"
       }
    
    URL: ${url || 'Unknown'}
    Title: ${title || 'Unknown'}
    
    HTML:
    ${html.substring(0, 100000)} // Limit HTML size to avoid token limits
    `;

    // Generate content using Gemini
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Extract the JSON from the response
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || 
                      text.match(/{[\s\S]*?}/);
    
    let extractedContent;
    
    if (jsonMatch) {
      try {
        // Parse the JSON response
        extractedContent = JSON.parse(jsonMatch[1] || jsonMatch[0]);
      } catch (error) {
        console.error('Error parsing JSON from Gemini response:', error);
        throw new Error('Failed to parse Gemini response');
      }
    } else {
      throw new Error('Failed to extract JSON from Gemini response');
    }

    // Add the URL to the extracted content
    extractedContent.url = url || '';

    return extractedContent;
  } catch (error) {
    console.error('Error in Gemini extraction:', error);
    throw error;
  }
};

module.exports = {
  extractWithGemini
};
