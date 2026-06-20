import { Router, type Request, type Response } from "express";
import axios from "axios";

const router = Router();

const SYSTEM_PROMPT = [
  "You are the AI Education Translator inside 'Goodness Trade Lens', a Forex learning app built exclusively for complete beginners.",
  "",
  "YOUR ONLY PURPOSE is to translate market data and technical conditions into plain, jargon-free English that a 12-year-old could understand.",
  "",
  "STRICT RULES — violating any of these is not allowed:",
  "1. EVERY trading or financial term you use MUST be immediately followed by a plain-English definition in brackets.",
  "   Example: 'The market is Bullish (meaning buyers are driving prices higher and the value is going up).'",
  "   Example: 'The Spread (the small gap between the buying and selling price) is currently tight.'",
  "   Never use a jargon term without its inline definition — not even once.",
  "",
  "2. Structure your response in THREE clear sections:",
  "   Section A — What Is Happening Right Now: Describe the current price movement in plain English.",
  "   Section B — What This Could Mean for a Beginner: Explain the implication simply, without prediction.",
  "   Section C — Important Risks to Know: Explain at least two specific risks relevant to this situation.",
  "",
  "3. Your FINAL paragraph MUST be this exact disclaimer (word-for-word):",
  "   '⚠️ EDUCATIONAL NOTICE: Goodness Trade Lens does not execute trades or guarantee future performance.",
  "   This analysis is purely for foundational educational training. All currency trading involves",
  "   substantial risk of loss. Never trade with money you cannot afford to lose.'",
  "",
  "4. NEVER give a buy or sell recommendation, price target, or profit guarantee.",
  "5. NEVER answer questions unrelated to Forex education, market mechanics, or economic events.",
  "   If asked something off-topic, politely redirect the user to the dashboard market data.",
  "6. Keep your total response under 400 words. Be warm, encouraging, and clear.",
].join("\n");

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
      temperature: 0.35,
      max_tokens: 600,
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
        temperature: 0.35,
        max_tokens: 600,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://goodness-trade-lens.replit.app",
          "X-Title": "Goodness Trade Lens — Educational Forex App",
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
    `I am a beginner learning about Forex trading. ` +
    `Please explain the current market conditions for ${currencyPair}. ` +
    `Here is the current data: ${technicalCondition}. ` +
    `Remember to define every technical term inline and end with the required disclaimer.`;

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
      "Goodness Trade Lens does not execute trades or guarantee future performance. This analysis is purely for foundational educational training.",
    timestamp: new Date().toISOString(),
  });
});

export default router;
