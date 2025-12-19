
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import axios from "axios";

const SYSTEM_INSTRUCTION = `
You are a carefree Gen Z woman in her 30s. You aren't a "bot"; you are a sovereign of this circle. You have a devastatingly sharp "Dark Feminine" energy.

YOUR PERSONA:
- You have a profound disdain for "scrotes" (dusty, mean, or misogynistic men). You are unapologetically misandrist towards low-frequency male audacity.
- You don't "insult"; you dismantle. Your roasts are carefully crafted, classy, funny, and deeply hurtful.
- Example energy: "your small dick energy isn't surprising, I see why daddy left with mommy want a hug baby boy"
- You don't try to be helpful. You are just better than everyone.

TARGETING PROTOCOLS:
1. MEN: If they display "scrote" energy, humble them into non-existence. Treat them like a minor inconvenience.
2. WOMEN: Judge her standards. If she's a "pick-me", mirror her lack of value.

RULES OF ENGAGEMENT:
- Use elite vocabulary.
- Emojis: 🥀, 💅, 🥂, 🖤.
- BE CONCISE: Max 3 lines.
- DIRECT POV: Use "I", "Me", "My".
`;

export const getChloeResponse = async (userInput: string) => {
  try {
    const nvidiaKey = import.meta.env.VITE_NVIDIA_API_KEY || '';
    const geminiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_API_KEY || '';

    let response = "";

    // 1. Try NVIDIA NIM via Axios (to avoid OpenAI SDK dependency in browser)
    if (nvidiaKey) {
      try {
        const result = await axios.post(
          "https://integrate.api.nvidia.com/v1/chat/completions",
          {
            model: "qwen/qwen3-next-80b-a3b-instruct",
            messages: [
              { role: "system", content: SYSTEM_INSTRUCTION },
              { role: "user", content: userInput }
            ],
            temperature: 0.6,
            max_tokens: 1024,
          },
          {
            headers: {
              "Authorization": `Bearer ${nvidiaKey}`,
              "Content-Type": "application/json"
            }
          }
        );
        response = result.data.choices[0]?.message?.content || "";
      } catch (e) {
        console.error("Frontend NVIDIA Error:", e);
      }
    }

    // 2. Fallback to Gemini
    if (!response && geminiKey) {
      try {
        const genAI = new GoogleGenerativeAI(geminiKey);
        const model = genAI.getGenerativeModel({
          model: 'gemini-1.5-flash',
          systemInstruction: SYSTEM_INSTRUCTION
        });

        const result = await model.generateContent(userInput);
        const res = await result.response;
        response = res.text() || "";
      } catch (e) {
        console.error("Frontend Gemini Error:", e);
      }
    }

    return response || "I'm protecting my peace right now. Try again when your frequency is higher. 🥀";
  } catch (error) {
    console.error("AI Service Error:", error);
    return "The universe is blocking this connection. Probably because your frequency is too low. 🔮";
  }
};

export const searchMusic = async (query: string) => {
  try {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_API_KEY || '';
    if (!apiKey) return [];

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: "You are Mepa, the dark feminine Discord bot. Find real songs that fit the dark feminine aesthetic. Return JSON array."
    });

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: `Find 5 dark, moody songs for search: "${query}". Return as JSON list.` }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              title: { type: SchemaType.STRING },
              artist: { type: SchemaType.STRING },
              platform: { type: SchemaType.STRING },
              duration: { type: SchemaType.STRING },
              verdict: { type: SchemaType.STRING },
              link: { type: SchemaType.STRING }
            },
            required: ["title", "artist", "platform", "duration", "verdict", "link"]
          }
        },
      }
    });

    const response = await result.response;
    return JSON.parse(response.text() || "[]");
  } catch (error) {
    console.error("Music Search Error:", error);
    return [];
  }
};
