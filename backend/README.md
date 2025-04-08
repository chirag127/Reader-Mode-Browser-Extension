# Reader Mode Backend

This is the backend server for the Reader Mode Browser Extension. It uses Express.js and the Google Generative AI API (Gemini 2.0 Flash Lite) to extract the main content from web pages.

## Features

- Content extraction using Google's Gemini 2.0 Flash Lite model
- Clean API for the browser extension to communicate with
- Error handling and fallback mechanisms
- CORS support for cross-origin requests

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Google AI API key (for Gemini)

## Installation

1. Clone the repository (if you haven't already)
2. Navigate to the backend directory:
   ```
   cd backend
   ```
3. Install dependencies:
   ```
   npm install
   ```
4. Create a `.env` file based on the `.env.example` file:
   ```
   cp .env.example .env
   ```
5. Add your Google AI API key to the `.env` file:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```

## Running the Server

### Development Mode

To run the server in development mode with auto-restart on file changes:

```
npm run dev
```

### Production Mode

To run the server in production mode:

```
npm start
```

## API Endpoints

### Extract Content

Extracts the main content from a webpage's HTML.

- **URL**: `/api/extract`
- **Method**: `POST`
- **Content-Type**: `application/json`
- **Request Body**:
  ```json
  {
    "html": "Full HTML content of the webpage",
    "url": "URL of the webpage (optional)",
    "title": "Title of the webpage (optional)"
  }
  ```
- **Success Response**:
  - **Code**: 200
  - **Content**:
    ```json
    {
      "success": true,
      "article": {
        "title": "Article title",
        "content": "HTML content of the article",
        "textContent": "Plain text content of the article",
        "byline": "Author name (if available)",
        "siteName": "Website name (if available)",
        "url": "Original URL"
      }
    }
    ```
- **Error Response**:
  - **Code**: 400 or 500
  - **Content**:
    ```json
    {
      "error": {
        "message": "Error message",
        "status": 400
      }
    }
    ```

## Health Check

Check if the server is running.

- **URL**: `/health`
- **Method**: `GET`
- **Success Response**:
  - **Code**: 200
  - **Content**:
    ```json
    {
      "status": "ok",
      "message": "Server is running"
    }
    ```

## Configuration

You can configure the server by modifying the `.env` file:

- `PORT`: The port on which the server will run (default: 3000)
- `NODE_ENV`: The environment (development or production)
- `GEMINI_API_KEY`: Your Google AI API key

## Getting a Gemini API Key

1. Go to the [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Copy the API key to your `.env` file

## Troubleshooting

- If you encounter CORS errors, make sure the extension is using the correct URL for the backend server.
- If the Gemini API is not working, check your API key and make sure you have sufficient quota.
- If the server won't start, check that the port is not already in use.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
