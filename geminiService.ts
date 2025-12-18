
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

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
    if (!apiKey) return "My crystals are dim... (API Key missing) 🥀";

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: SYSTEM_INSTRUCTION
    });

    const result = await model.generateContent(userInput);
    const response = await result.response;
    return response.text() || "I'm protecting my peace right now. Try again later. 🥀";
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

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: "You are Mepa, the dark feminine Discord bot. You are acting as a Music API. Find real, high-quality songs that fit the dark feminine, empowering, and moody aesthetic. Return realistic song data with a 'verdict' where you judge the vibe. Only return the JSON array."
    });

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: `Find 5 dark, moody, or empowering songs related to the search: "${query}". Return them as a JSON list.` }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              title: { type: SchemaType.STRING },
              artist: { type: SchemaType.STRING },
              platform: { type: SchemaType.STRING, description: "Spotify or YouTube" },
              duration: { type: SchemaType.STRING, description: "e.g. 3:45" },
              verdict: { type: SchemaType.STRING, description: "Mepa's dark feminine opinion on this song." },
              link: { type: SchemaType.STRING, description: "A simulated but realistic URL for the song." }
            },
            required: ["title", "artist", "platform", "duration", "verdict", "link"]
          }
        },
      }
    });

    const response = await result.response;
    const text = response.text();
    return JSON.parse(text || "[]");
  } catch (error) {
    console.error("Music Search Error:", error);
    return [];
  }
};
