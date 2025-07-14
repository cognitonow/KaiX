# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

## Run Locally

**Prerequisites:**  Node.js

1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key for the serverless function.
3. Run the app:
   `npm run dev`

### Local API Key (Alternative to .env.local)

For quick testing without setting up a `.env.local` file and running the dev server, you can use the application in a client-only mode.

1.  Open the application in your browser (e.g., by opening `index.html`).
2.  Click the "SETTINGS" button.
3.  In the "Local Gemini API Key" field, paste your Gemini API key.
4.  Click "Save & Close".

The application will now use this key to make direct calls to the Gemini API from your browser. The key is stored in your browser's `localStorage` and is not sent to any server. This is intended for development and testing purposes only. To switch back to using the server-side key, simply clear the input field in the settings and save.