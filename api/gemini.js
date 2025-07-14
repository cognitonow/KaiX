import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { contents } = req.body;

    if (!contents) {
        return res.status(400).json({ error: 'Contents for the AI model are required.' });
    }

    const API_KEY = process.env.API_KEY;
    if (!API_KEY) {
        console.error('API key not configured on the server.');
        return res.status(500).json({ error: 'Internal server error: API key not configured.' });
    }

    try {
        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const result = await model.generateContent({
            contents: contents,
        });

        const response = result.response;
        const aiResponse = response.text();
        
        return res.status(200).json({ text: aiResponse });

    } catch (error) {
        console.error("Error in serverless function:", error);
        return res.status(500).json({ error: 'Failed to communicate with the AI service.' });
    }
}
