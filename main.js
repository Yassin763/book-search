
const express = require("express");
const Groq = require("groq-sdk");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

app.post("/api/book-description", async (req, res) => {
  try {
    const { title, author, description } = req.body;

    if (!title || !author) {
      return res.status(400).json({
        error: "Book title and author are required.",
      });
    }

    const prompt = `
You are a helpful book assistant.

Book title: ${title}
Author: ${author}
Available description: ${description || "Not provided"}

Write a concise summary based on reliable information.
Use the provided description as your main source.
Do not invent plot details.
If there is insufficient information, say so clearly.
Write 100-150 words in English.
`;



const completion = await groq.chat.completions.create({
  model: "openai/gpt-oss-20b",
  messages: [
    {
      role: "system",
      content:
        "You are a book assistant. Return only the final book summary. Do not include your reasoning or analysis. If the provided information is insufficient, say so briefly.",
    },
    {
      role: "user",
      content: `
Summarize this book in 100-150 words.

Title: ${title}
Author: ${author}
Available description: ${description || "Not provided"}

Use reliable information. Do not invent plot details.
If information is insufficient, clearly say so.
Return only the summary.
      `,
    },
  ],
  max_completion_tokens: 1000,
  reasoning_effort: "low",
});

const summary =
  completion.choices?.[0]?.message?.content?.trim();

console.log("Summary:", summary);
console.log("Finish reason:", completion.choices?.[0]?.finish_reason);

if (!summary) {
  return res.status(502).json({
    error: "The AI could not generate a summary.",
  });
}

return res.json({ description: summary });



} catch (error) {
  console.error("Groq API error:", {
    message: error.message,
    status: error.status,
    code: error.code,
    details: error.error,
  });

  return res.status(502).json({
    error: error.message || "Failed to generate book summary.",
  });
}

});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
