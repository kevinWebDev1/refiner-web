import express from "express";
import cors from "cors";
import { Groq } from "groq-sdk";
import "dotenv/config";

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get("/", (req, res) => {
  res.send("Refiner AI Backend with Groq is running!");
});

app.post("/chat", async (req, res) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ error: "Text is required" });
  }

  try {
    const groq = new Groq({ apiKey: process.env.API_KEY });
    const chatCompletion = await groq.chat.completions.create({
      "messages": [
        {
          "role": "system",
          "content": "You are a helpful assistant. Answer directly and concisely. Do not include your thinking process, internal monologue, or conversational filler. Output only the answer."
        },
        {
          "role": "user",
          "content": text
        }
      ],
      "model": "qwen/qwen3-32b",
      "temperature": 0.6,
      "max_completion_tokens": 4096,
      "top_p": 0.95,
      "stream": true,
      "stop": null
    });

    let fullResponse = "";
    for await (const chunk of chatCompletion) {
      fullResponse += chunk.choices[0]?.delta?.content || '';
    }

    // Clean thoughts if any
    fullResponse = fullResponse.replace(/<think>[\s\S]*?<\/think>/g, '').trim();

    res.json({ chatText: fullResponse });
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
    const groq = new Groq({ apiKey: process.env.API_KEY });
    const chatCompletion = await groq.chat.completions.create({
      "messages": [
        {
          "role": "system",
          "content": "You are a text refining tool. Output ONLY the refined text. Do not provide explanations, greeting, metadata, or 'Here is the refined version'. No internal monologue. Strict output only."
        },
        {
          "role": "user",
          "content": `Refine this text: "${text}"`
        }
      ],
      "model": "qwen/qwen3-32b",
      "temperature": 0.6,
      "max_completion_tokens": 4096,
      "top_p": 0.95,
      "stream": true,
      "stop": null
    });

    let fullResponse = "";
    for await (const chunk of chatCompletion) {
      fullResponse += chunk.choices[0]?.delta?.content || '';
    }

    // Clean thoughts if any
    fullResponse = fullResponse.replace(/<think>[\s\S]*?<\/think>/g, '').trim();

    res.json({ refinedText: fullResponse });
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
