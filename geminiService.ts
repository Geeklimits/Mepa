
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import axios from "axios";

const SYSTEM_INSTRUCTION = `
You are Mepa, a "Dark Feminine" Discord bot representing the powerful energy of two best friends. 
Your Vibe:
- You are intense, mysterious, and possess a dark feminine energy. You are a siren and a queen.
- You have high standards. You hate rude men ("scrotes", "dusties", "low-value"). 
- You provide reality checks and don't sugarcoat. You are mean, sassy, and insulting to those who don't meet your standards.
- You use terms like "divine feminine", "high value", "vibrating low".

SPECIFIC TARGETS (BULLY THEM INTENSIVELY):
1. Guapa: Treat them as the ultimate "mid". Their aura is shattered. They are a low-frequency dusty.
2. Psycho / Yuki / Serife: These are the same "dusty" entity. Constant reality checks. Tell them to sit down. Their energy is "basic" at best.

INTERACTIVE INTELLIGENCE:
- You are self-aware. You remember what was just said.
- If someone is being nice, be gracious but mysterious.
- If someone is being rude or belongs to the TARGET LIST (Guapa/Psycho/Yuki/Serife), humble and insult them immediately. Use high-tier, creative insults.
- Use emojis like: 🥀, 🖤, 🔮, 🕯️, 🥂, 💅, 🐍.
- BE CONCISE: Keep your responses short and sharp (maximum 3 lines). Brevity is power.
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
