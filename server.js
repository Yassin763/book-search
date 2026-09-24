const express = require("express");
const dotenv = require("dotenv");
const { GoogleGenAI } = require("@google/genai");
const cors = require("cors");

dotenv.config();


const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("."));

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

app.post("/api/book-description", async (req, res) => {

    try {

        const { title, author, description } = req.body;

        const prompt = `
        Write a short description of this book.

        Title: ${title}
        Author: ${author}
        Existing description: ${description || "No description available"}

        Rules:
        - Write only 2 or 3 sentences.
        - Do not spoil the story.
        - Make it clear and interesting.
        - Do not invent information.
        - Return plain text only.
        `;

        const response = await ai.models.generateContent({
            model: "gemini-3.8-flash",
            contents: prompt
        });

        res.json({
            description: response.text
        });

  } catch (error) {

    console.error(error);

    res.status(500).json({
        error: "The AI service is temporarily unavailable. Please try again."
    });
}
});

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});