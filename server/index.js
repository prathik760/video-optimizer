const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config(); // Make sure you have a .env file

const app = express();
const PORT = 5001;

app.use(cors());
app.use(express.json());

// 🧠 Google Gemini API key from environment
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;



// ✨ Gemini Helper Function
async function callGemini(prompt) {
  const body = {
    contents: [
      {
        parts: [{ text: prompt }],
      },
    ],
  };

  const response = await axios.post(GEMINI_URL, body);
  return response.data.candidates[0].content.parts[0].text;
}

// 🎯 Generate Titles
app.post('/api/generate-title', async (req, res) => {
  const { title, topic } = req.body;
  const prompt = `
Generate 3 viral and SEO-optimized YouTube video titles.

Video Title: "${title}"
Topic: "${topic}"

Return only the 3 titles as a numbered list (1., 2., 3.) — no extra text.
`;

  try {
    const raw = await callGemini(prompt);
    const suggestions = raw
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.match(/^[0-9]+\./));

    res.json({ suggestions });
  } catch (error) {
    console.error("❌ Gemini error:", error?.response?.data || error.message);
    res.status(500).json({ error: 'Failed to generate titles with Gemini.' });
  }
});

// 🏷️ Generate Keywords
app.post('/api/generate-keywords', async (req, res) => {
  const { title } = req.body;
  const prompt = `
Suggest 10 SEO-friendly hashtags for this YouTube title: "${title}"

Only return hashtags like #ai #marketing etc., separated by new lines.
Avoid using #sure or generic terms.
`;

  try {
    const raw = await callGemini(prompt);
    const keywords = raw
      .split('\n')
      .map((kw) => kw.trim().toLowerCase().replace(/^#/, ''))
      .filter((kw) => kw && kw !== 'sure');

    res.json({ keywords });
  } catch (error) {
    console.error("❌ Gemini keyword error:", error?.response?.data || error.message);
    res.status(500).json({ error: 'Failed to generate keywords with Gemini.' });
  }
});

// 📝 Generate Description
app.post('/api/generate-description', async (req, res) => {
  const { title } = req.body;
  const prompt = `
Write a short, engaging, and SEO-friendly YouTube description for the video titled "${title}".

Use keywords naturally, make it about 2-3 lines, and keep it audience-friendly.
`;

  try {
    const description = await callGemini(prompt);
    res.json({ description: description.trim() });
  } catch (error) {
    console.error("❌ Gemini description error:", error?.response?.data || error.message);
    res.status(500).json({ error: 'Failed to generate description with Gemini.' });
  }
});

// 🟢 Health Check
app.get('/', (req, res) => {
  res.send('✅ Gemini AI backend is running!');
});

app.listen(PORT, () => {
  console.log(`🚀 Backend running at http://localhost:${PORT}`);
});
