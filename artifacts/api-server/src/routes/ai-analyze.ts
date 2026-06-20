import { Router, type Request, type Response } from "express";
import axios from "axios";

const router = Router();

const SYSTEM_PROMPT =
  "You are an embedded Fintech engine inside a beginner's training app. " +
  "You only interpret financial charts, metrics, and economic data. " +
  "Translate complex trading jargon like 'Bullish', 'Bearish', and 'Overbought' into clear, simple English for a complete beginner. " +
  "You MUST emphasize that trading carries extreme inherent risk. " +
  "Never guarantee profits or provide direct, unregulated buy/sell advice. " +
  "If the user asks about anything unrelated to trading, market terms, or asset mechanics, " +
  "politely refuse to answer and redirect them to the dashboard.";

interface AnalyzeRequestBody {
  currencyPair?: string;
  technicalCondition?: string;
}

async function callGroq(userMessage: string): Promise<string> {
  const apiKey = process.env["GROQ_API_KEY"];
  if (!apiKey) throw new Error("GROQ_API_KEY not configured");

  const response = await axios.post(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      model: "llama3-8b-8192",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userMessage },
      ],
      temperature: 0.4,
      max_tokens: 512,
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      timeout: 20000,
    },
  );

  const content = response.data?.choices?.[0]?.message?.content;
  if (!content) throw new Error("Empty response from Groq");
  return content;
}

async function callOpenRouter(userMessage: string): Promise<string> {
  const apiKey = process.env["OPENROUTER_API_KEY"];
  if (!apiKey) throw new Error("OPENROUTER_API_KEY not configured");

  let response;
  try {
    response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "meta-llama/llama-3.1-8b-instruct",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userMessage },
        ],
        temperature: 0.4,
        max_tokens: 512,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://forex-edu-app.replit.app",
          "X-Title": "Forex Educational Analytics",
        },
        timeout: 20000,
      },
    );
  } catch (err) {
    if (axios.isAxiosError(err) && err.response) {
      const body = JSON.stringify(err.response.data);
      throw new Error(`OpenRouter HTTP ${err.response.status}: ${body}`);
    }
    throw err;
  }

  const content = response.data?.choices?.[0]?.message?.content;
  if (!content) throw new Error("Empty response from OpenRouter");
  return content;
}

router.post("/ai-analyze", async (req: Request, res: Response) => {
  const { currencyPair, technicalCondition } = req.body as AnalyzeRequestBody;

  if (!currencyPair || !technicalCondition) {
    res.status(400).json({
      success: false,
      error: "Both 'currencyPair' and 'technicalCondition' are required.",
    });
    return;
  }

  const userMessage =
    `Currency pair: ${currencyPair}. ` +
    `Current technical condition: ${technicalCondition}. ` +
    `Please explain what this means in simple terms for a beginner Forex learner.`;

  let analysisText: string | null = null;
  let providerUsed: string | null = null;
  const errors: string[] = [];

  if (process.env["GROQ_API_KEY"]) {
    try {
      analysisText = await callGroq(userMessage);
      providerUsed = "groq";
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      errors.push(`Groq: ${message}`);
      req.log.warn({ err }, "Groq request failed, trying OpenRouter");
    }
  }

  if (!analysisText && process.env["OPENROUTER_API_KEY"]) {
    try {
      analysisText = await callOpenRouter(userMessage);
      providerUsed = "openrouter";
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      errors.push(`OpenRouter: ${message}`);
      req.log.warn({ err }, "OpenRouter request also failed");
    }
  }

  if (!analysisText) {
    const noKeyConfigured =
      !process.env["GROQ_API_KEY"] && !process.env["OPENROUTER_API_KEY"];

    if (noKeyConfigured) {
      res.status(503).json({
        success: false,
        error:
          "No AI provider is configured. Please add GROQ_API_KEY or OPENROUTER_API_KEY to your environment secrets.",
      });
    } else {
      res.status(502).json({
        success: false,
        error: "All configured AI providers failed to respond.",
        details: errors,
      });
    }
    return;
  }

  res.json({
    success: true,
    provider: providerUsed,
    currencyPair,
    technicalCondition,
    analysis: analysisText,
    disclaimer:
      "This analysis is for educational purposes only. Trading carries extreme risk. This is not financial advice.",
    timestamp: new Date().toISOString(),
  });
});

export default router;
