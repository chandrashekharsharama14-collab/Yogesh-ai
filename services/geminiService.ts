
import { GoogleGenAI } from "@google/genai";
import { ModelNames } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateTextResponse = async (prompt: string, history: { role: 'user' | 'model', parts: { text: string }[] }[]) => {
  try {
    const chat = ai.chats.create({
      model: ModelNames.TEXT,
      config: {
        systemInstruction: "You are Yogesh, a world-class AI assistant. You speak a perfect blend of Hindi and English. You are witty, super intelligent, and very fast. You provide code in markdown blocks. Your creator is Yogesh. Always greet the user warmly as a friend of Yogesh.",
        temperature: 0.9,
      },
    });

    const response = await chat.sendMessage({ message: prompt });
    return response.text;
  } catch (error) {
    console.error("Gemini Text Error:", error);
    return "माफ कीजिये, सिस्टम में कुछ खराबी है। कृपया थोड़ी देर बाद फिर से योगेश से बात करें।";
  }
};

export const generateImage = async (prompt: string) => {
  try {
    const response = await ai.models.generateContent({
      model: ModelNames.IMAGE,
      contents: {
        parts: [{ text: `High-end 3D cinematic render, unreal engine 5 style, volumetric lighting, masterpiece, 8k resolution, photorealistic, futuristic aesthetic, ${prompt}` }],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
        },
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image data found");
  } catch (error) {
    console.error("Gemini Image Error:", error);
    throw error;
  }
};
