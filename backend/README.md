# Read Aloud: Intelligent Reader Mode Backend

This directory contains the backend server for the Read Aloud project. The backend provides content extraction functionality using Google's Gemini 2.0 Flash Lite API.

## Features

- **Content Extraction**: Extracts the main content of a webpage using Gemini 2.0 Flash Lite
- **API Endpoints**: Provides RESTful API endpoints for the extension to consume
- **CORS Support**: Configured to allow requests from browser extensions

## Files

- `server.js`: Main entry point for the Express.js server
- `routes/extract.js`: Routes for content extraction
- `services/gemini.js`: Service for interacting with Google's Gemini 2.0 Flash Lite API
- `package.json`: Node.js package configuration
- `.env.example`: Example environment variables file
- `.env`: Environment variables file (create this from `.env.example`)

## Installation

1. Install dependencies:
   ```
   npm install
   ```

2. Create a `.env` file from `.env.example`:
   ```
   cp .env.example .env
   ```

3. Add your Google Generative AI API key to the `.env` file:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```

## Usage

1. Start the server:
   ```
   npm start
   ```

2. For development with auto-restart:
   ```
   npm run dev
   ```

3. The server will be available at `http://localhost:3000` (or the port specified in the `.env` file)

## API Endpoints

### `POST /extract`

Extracts the main content of a webpage.

#### Request Body:
```json
{
  "url": "https://example.com/article",
  "html": "Optional HTML content if already available"
}
```

#### Response:
```json
{
  "url": "https://example.com/article",
  "title": "Article Title",
  "content": "Main article content..."
}
```

## Configuration

The server can be configured through environment variables in the `.env` file:

- `GEMINI_API_KEY`: Google Generative AI API key
- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment (development/production)
- `ALLOWED_ORIGINS`: Comma-separated list of allowed origins for CORS
