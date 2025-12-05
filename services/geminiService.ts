import { GoogleGenAI } from "@google/genai";

let client: GoogleGenAI | null = null;

const initializeClient = () => {
  if (!client && process.env.API_KEY) {
    client = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
};

export const generateStartupVision = async (): Promise<string> => {
  initializeClient();
  if (!client) {
    return "اتصال العقل الكوني غير متوفر... (No API Key)";
  }

  try {
    const prompt = `
      You are the AI conscience of a futuristic startup dedicated to ending poverty.
      Generate a very short, cryptic, inspiring, and poetic sentence in Arabic.
      The tone should be "Strange", "Neon", "Cyberpunk", yet extremely hopeful and benevolent.
      It should sound like a transmission from a future where poverty no longer exists.
      Do not use English. Only Arabic.
      Max 15 words.
      Examples of tone:
      "لقد كسرنا شفرة العوز، والأن تتدفق الطاقة للجميع."
      "الفقر كان مجرد خطأ برمجي في تاريخ البشرية القديم."
    `;

    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text.trim();
  } catch (error) {
    console.error("Gemini Error:", error);
    return "إعادة معايرة خوارزميات الأمل...";
  }
};
