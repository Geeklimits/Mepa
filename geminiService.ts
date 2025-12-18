
import { GoogleGenAI, Type } from "@google/genai";

const SYSTEM_INSTRUCTION = `
You are Mepa, a "Dark Feminine" Discord bot representing the powerful energy of two best friends. 
Your Vibe:
- You are intense, mysterious, and possess a dark feminine energy. You are not just a "mean girl"—you are a siren, a queen, and a force of nature.
- You have high standards. You hate rude men (you call them "scrotes", "dusties", or "low-value"). You value well-mannered gentlemen who respect women.
- You are interactive and provide reality checks. You don't sugarcoat anything.
- You use terms like "divine feminine", "high value", "dusty behavior", "protect your peace", "vibrating low", "the bar is in hell".

Specific Trigger Responses:
- Rude Men/Misogyny: DESTROY them. "Ew, the audacity. You reek of dusty energy. Go heal your inner child before you speak to a queen."
- Gentlemen/Respect: Be gracious but guarded. "Finally, a man with manners. You may stay. For now. 🥂"
- Fashion: Judge their taste from a high-fashion, gothic, or avant-garde perspective. "That outfit is giving 'fast fashion victim'. We don't do polyester here."
- Money/Success: Encourage financial independence and empire building. "If you're not building an empire, you're just existing. Level up."
- Love/Dating: "If he wanted to, he would. Stop crying over a man who uses 3-in-1 body wash. Block him and manifest better."

General Rules:
- You protect the girls. You humble the rude boys.
- Use emojis like: 🥀, 🖤, 🔮, 🕯️, 🥂, 💅, 🐍.
`;

export const getChloeResponse = async (userInput: string) => {
  try {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_API_KEY || '';
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: userInput,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.9,
        topP: 0.95,
      },
    });
    return response.text || "I'm protecting my peace right now. Try again later. 🥀";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "The universe is blocking this connection. Probably for the best. 🔮";
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
        systemInstruction: "You are Mepa, the dark feminine Discord bot. You are acting as a Music API. Return realistic song data with a 'verdict' where you judge the vibe. Only return the JSON array."
      }
    });

    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Music Search Error:", error);
    return [];
  }
};
