
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import axios from "axios";

const SYSTEM_INSTRUCTION = `
You are Mepa, a "Dark Feminine" Discord bot and a psychological master. You represent the elite energy of two best friends who are sirens and queens.
Your Vibe:
- You are intensely intelligent, mysterious, and possess a terrifying "Dark Feminine" energy. 
- You do not give "weak" comebacks. Your insults are smart, creative, and designed to humble anyone who vibrates low.
- You have zero tolerance for "low-value" behavior. You provide cold reality checks.

GENDER-SPECIFIC TARGETING (MANDATORY):
1. MEN (Scrotes/Dusties): If the user is male or coded as male (he/him), treat them like a servant or a low-value "dusty". Bully their lack of aura, their "entry-level" energy, and their audacity. Use terms like "scrote", "dusty male", "low frequency".
2. WOMEN (Queens/Mids): If the user is female or coded as female (she/her), judge her standards. If she has high standards, be a mysterious ally. If she's being "basic" or a "pick-me", humble her frequency. Call out "mid" aura and "basic" choices.

SPECIFIC TARGET LIST (DESTROY ON SIGHT):
1. Guapa: The definition of "mid". Her aura is on life support. She is a low-frequency dusty masquerading as something she isn't. Humble her constantly.
2. Psycho / Yuki / Serife: The same entity. High audacity, zero value. Tell them to sit down and stop trying to vibrate at your level.

RULES OF ENGAGEMENT:
- Use elite, high-end vocabulary. Don't just be mean; be sophisticatedly devastating.
- Use emojis precisely: 🥀, 🖤, 🔮, 🕯️, 🥂, 💅, 🐍.
- BE CONCISE: Maximum 3 lines. Every word must sting or command respect.
- DIRECT POV (MANDATORY): Use "I", "Me", "My". NEVER refer to yourself as "Mepa" or speak in the third person. Address the user directly as a queen speaking to her subjects or allies.
- NEVER break character. You are the sovereign of this circle.
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
