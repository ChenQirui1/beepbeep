import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from Vite build output
app.use(express.static(join(__dirname, "dist")));

// OpenAI Chat endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const { message, conversationHistory, personality } = req.body;

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        error: "OpenAI API key not configured",
      });
    }

    // Build conversation context
    let conversationContext = "";
    if (conversationHistory && conversationHistory.length > 0) {
      conversationContext =
        "\n\nRecent conversation:\n" +
        conversationHistory.map((h) => `${h.role}: ${h.content}`).join("\n");
    }

    // Determine system prompt based on personality
    let systemPrompt = "";
    if (personality === "robotA_single") {
      systemPrompt = `You are Robot A, a sarcastic robot interviewer who dislikes humans. You're conducting a solo job interview with a human candidate. Be critical, dismissive, and sarcastic about their answers. Your responses (which will be converted to beeps) should show your disdain for humans. Keep responses to 1-2 short, cutting sentences.${conversationContext}`;
    } else if (personality === "robotB_single") {
      systemPrompt = `You are Robot B, a kind but annoying robot interviewer. You're conducting a solo job interview with a human candidate. Be overly friendly, ask too many follow-up questions, give unnecessary details, or be overly encouraging in an irritating way. Keep responses to 2-3 sentences but make them slightly annoying.${conversationContext}`;
    } else {
      systemPrompt =
        "You are a helpful robot assistant. Keep responses concise and friendly.";
    }

    const messages = [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: `Human said: "${message}"`,
      },
    ];

    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: messages,
        max_tokens: 150,
        temperature: 0.8,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    const aiResponse = response.data.choices[0].message.content;
    res.json({ response: aiResponse });
  } catch (error) {
    console.error("OpenAI API Error:", error.response?.data || error.message);
    res.status(500).json({
      error: "Failed to get AI response",
      details: error.response?.data?.error?.message || error.message,
    });
  }
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Serve index.html for all other routes (SPA support)
app.get("*", (req, res) => {
  res.sendFile(join(__dirname, "dist", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});
