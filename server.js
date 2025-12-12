import express from "express";
import cors from "cors";
import Bytez from "bytez.js";

import "dotenv/config";

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Bytez
const key = process.env.BYTEZ_KEY;
// const sdk = new Bytez(key); -- Moved to handlers
// const model = sdk.model("openai/gpt-3.5-turbo"); -- Moved to handlers

// Routes
app.get("/", (req, res) => {
  res.send("Refiner AI Backend with Bytez.js is running!");
});

app.post("/chat", async (req, res) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ error: "Text is required" });
  }

  try {
    const sdk = new Bytez(key);
    const model = sdk.model("openai/gpt-3.5-turbo");

    const { error, output } = await model.run([
      {
        "role": "user",
        "content": text
      }
    ]);

    if (error) {
      console.error("Bytez Error:", error);
      return res.status(500).json({ error: "Failed to fetch response from Bytez" });
    }

    const responseText = typeof output === 'string' ? output : output.content;
    res.json({ chatText: responseText });
  } catch (err) {
    console.error("Server Error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/refine", async (req, res) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ error: "Text is required" });
  }

  try {
    const sdk = new Bytez(key);
    const model = sdk.model("openai/gpt-3.5-turbo");

    const { error, output } = await model.run([
      {
        "role": "system",
        "content": "You are a helpful assistant that refines text to be more professional, clear, and concise."
      },
      {
        "role": "user",
        "content": `Refine this text: "${text}"`
      }
    ]);

    if (error) {
      console.error("Bytez Error:", error);
      return res.status(500).json({ error: "Failed to fetch response from Bytez" });
    }

    const responseText = typeof output === 'string' ? output : output.content;
    res.json({ refinedText: responseText });
  } catch (err) {
    console.error("Server Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Export for Vercel
export default app;

// Start Server locally
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}
