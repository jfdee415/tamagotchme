// server.js
const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.post("/generate", async (req, res) => {
  const { handle, image_url } = req.body;

  try {
    const profilePic = image_url || `https://unavatar.io/twitter/${handle}`;

    const userPrompt = `Using this image: ${profilePic}, generate a prompt to create a Tamagotchi-style pixel pet that resembles the person. Include face details, background, colors, accessories, body style, and vibe.`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openai/gpt-4o",
        messages: [
          { role: "system", content: "You are a creative image prompt generator." },
          { role: "user", content: userPrompt }
        ]
      })
    });

    const data = await response.json();
    const prompt = data.choices[0].message.content;

    res.json({
      prompt,
      image_url: profilePic
    });
  } catch (err) {
    console.error("❌ Error:", err);
    res.status(500).json({ error: "Generation failed" });
  }
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
