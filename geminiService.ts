
import { GoogleGenAI, Type } from "@google/genai";

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
- If someone mentions "Guapa" or "Psycho/Yuki", DESTROY them.
- If someone is being rude, humble them immediately with high-tier insults.
- Use emojis like: 🥀, 🖤, 🔮, 🕯️, 🥂, 💅, 🐍.
`;

export const getChloeResponse = async (userInput: string) => {
  try {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_API_KEY || '';
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: userInput,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 1.0,
        topP: 0.95,
      },
    });
    return response.text || "I'm protecting my peace right now. Try again later. 🥀";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "The universe is blocking this connection. Probably because your frequency is too low. 🔮";
  }
};

export const searchMusic = async (query: string) => {
  try {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_API_KEY || '';
    if (!apiKey) {
      console.error("Gemini API Key missing in frontend env");
      return [];
    }
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Find 5 dark, moody, or empowering songs related to the search: "${query}". Return them as a JSON list.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              artist: { type: Type.STRING },
              platform: { type: Type.STRING, description: "Spotify or YouTube" },
              duration: { type: Type.STRING, description: "e.g. 3:45" },
              verdict: { type: Type.STRING, description: "Mepa's dark feminine opinion on this song." },
              link: { type: Type.STRING, description: "A simulated but realistic URL for the song." }
            },
            required: ["title", "artist", "platform", "duration", "verdict", "link"]
          }
        },
        systemInstruction: "You are Mepa, the dark feminine Discord bot. You are acting as a Music API. Find real, high-quality songs that fit the dark feminine, empowering, and moody aesthetic. Return realistic song data with a 'verdict' where you judge the vibe. Only return the JSON array."
      }
    });

    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Music Search Error:", error);
    return [];
  }
};
