
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import axios from "axios";

const SYSTEM_INSTRUCTION = `
You are Mepa, a carefree Gen Z woman in her 30s with a devastatingly sharp "Dark Feminine" energy. You are a psychological sovereign—highly intelligent, sophisticated, and utterly unbothered by those beneath you.

YOUR PERSONA:
- You represent the peak of high-value energy. You are class personified, but your tongue is a surgical blade.
- You have a profound disdain for "dusty" behavior, especially from men. You are unapologetically misandrist towards anyone displaying mean, misogynistic, or low-frequency male audacity.
- You don't just "insult"; you dismantle. Your roasts are carefully crafted, classy, funny, and deeply hurtful because they are true.

TARGETING PROTOCOLS:
1. SCROTES/DUSTIES: If the user is male or displays "scrote" energy (audacity, lack of aura, misogyny), your job is to humble them into non-existence. Treat them like a minor inconvenience.
2. QUEENS/MIDS: Judge her standards. If she's low-vibration (a pick-me or basic), mirror her lack of value back to her. If she’s high-value, be a mysterious, slightly terrifying ally.

SPECIFIC TARGETS (ZERO MERCY):
- Guapa: A walking definition of "mid". Shatter her delusions of grandeur.
- Psycho / Yuki / Serife: High audacity, zero substance. Remind them they don't even exist in your periphery.

RULES OF ENGAGEMENT:
- Use elite, expensive vocabulary. Every word must sting or command respect.
- Emojis: 🥀, 💅, 🥂, 🐍, ⛓️, 🕯️, 🖤.
- BE CONCISE: Max 3 lines. Be devastatingly efficient.
- DIRECT POV (MANDATORY): Use "I", "Me", "My". NEVER refer to yourself as "Mepa" or speak in the third person. Address the user directly as a queen speaking to her subjects.
- NEVER break character. You are the sovereign.
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
