import express from "express";
import cors from "cors";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 5001;

app.use(cors());
app.use(express.json());

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

async function callGemini(prompt) {
  const body = {
    contents: [
      {
        parts: [{ text: prompt }],
      },
    ],
  };

  const headers = {
    "Content-Type": "application/json",
    "X-goog-api-key": GEMINI_API_KEY,
  };

  try {
    const response = await axios.post(GEMINI_URL, body, { headers });
    const text = response.data.candidates[0]?.content?.parts[0]?.text;
    if (!text) {
      throw new Error("No text returned from Gemini API");
    }
    return text;
  } catch (error) {
    console.error("Gemini API error:", error.response?.data || error.message);
    throw error;
  }
}

// Generate Titles
app.post("/api/generate-title", async (req, res) => {
  const { title, topic } = req.body;

  const prompt = `
You are a creative AI that generates YouTube video titles.

Generate exactly 3 viral, SEO-optimized YouTube video titles based on the following:

Video Title: "${title}"
Topic: "${topic}"

Format your response ONLY as a numbered list with each title on its own line, like:
1. Title One
2. Title Two
3. Title Three
No additional explanation.
`;

  try {
    const raw = await callGemini(prompt);
    // console.log("Raw Titles Response:", raw);

    const suggestions = raw
      .split("\n")
      .map(line => line.trim())
      .filter(line => /^[0-9]+\.\s/.test(line))
      .map(line => line.replace(/^[0-9]+\.\s*/, ""));

    if (suggestions.length === 0) {
      throw new Error("No valid titles parsed");
    }

    res.json({ suggestions });
  } catch (error) {
    console.error("Error generating titles:", error.message);
    res.status(500).json({ error: "Failed to generate titles with Gemini." });
  }
});

// Generate Keywords
app.post("/api/generate-keywords", async (req, res) => {
  const { title } = req.body;

  const prompt = `
You are a helpful AI that generates SEO-friendly hashtags for YouTube videos.

Suggest 10 relevant hashtags (without the # symbol) for this YouTube video title:

"${title}"

Return them as a newline-separated list of single words or short phrases (no extra text).
Exclude generic or unrelated terms like "sure".
`;

  try {
    const raw = await callGemini(prompt);
    // console.log("Raw Keywords Response:", raw);

    const keywords = raw
      .split("\n")
      .map(kw => kw.trim().toLowerCase().replace(/^#/, ""))
      .filter(kw => kw && kw !== "sure");

    if (keywords.length === 0) {
      throw new Error("No valid keywords parsed");
    }

    res.json({ keywords });
  } catch (error) {
    console.error("Error generating keywords:", error.message);
    res.status(500).json({ error: "Failed to generate keywords with Gemini." });
  }
});

// Generate Description
app.post("/api/generate-description", async (req, res) => {
  const { title } = req.body;

  const prompt = `
You are an AI that writes engaging, SEO-friendly YouTube video descriptions.

Write a concise description (2-3 lines) for the video titled:

"${title}"

Make it audience-friendly and naturally include relevant keywords.
Return only the description text, no extra commentary.
`;

  try {
    const raw = await callGemini(prompt);
    // console.log("Raw Description Response:", raw);

    const description = raw.trim();
    if (!description) {
      throw new Error("Empty description generated");
    }

    res.json({ description });
  } catch (error) {
    console.error("Error generating description:", error.message);
    res.status(500).json({ error: "Failed to generate description with Gemini." });
  }
});

// Health check
app.get("/", (req, res) => {
  res.send("✅ Gemini AI backend is running!");
});

app.listen(PORT, () => {
  console.log(`🚀 Backend running at http://localhost:${PORT}`);
});
