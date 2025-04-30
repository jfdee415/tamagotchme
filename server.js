const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Image generation endpoint using GPT-4o
app.post("/generate", async (req, res) => {
  const { handle } = req.body;
  if (!handle) return res.status(400).json({ error: "No handle provided" });

  const avatarUrl = `https://unavatar.io/twitter/${handle}`;

  const imagePrompt = `
A vintage Tamagotchi digital pet device with a classic egg-shaped plastic shell and three buttons. 
The screen displays a pixelated character in retro 8-bit style, representing the character from this image: ${avatarUrl}. 
The background of the screen shows a simple scene like a bedroom or sidewalk, using limited grayscale or vibrant pixel colors. 
The Tamagotchi casing has a nostalgic, 90s look with minor scuffs and bold ‘Tamagotchi’ branding at the top. 
The whole image has a soft, nostalgic lighting and a playful tone.
`;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/generate", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openai/gpt-4o",
        prompt: imagePrompt
      })
    });

    const data = await response.json();
    if (data?.image_url) {
      res.json({ image: data.image_url });
    } else {
      res.status(500).json({ error: "No image returned", detail: data });
    }
  } catch (err) {
    console.error("GPT-4o image generation error:", err);
    res.status(500).json({ error: "Image generation failed", detail: err.toString() });
  }
});

// Serve index.html for root route
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port", PORT));
