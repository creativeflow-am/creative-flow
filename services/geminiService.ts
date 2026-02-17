
import { GoogleGenAI } from "@google/genai";

// The API key must be obtained exclusively from the environment variable process.env.API_KEY.
// We create the GoogleGenAI instance inside the function to ensure it uses the correct key during execution.

export const optimizeCaption = async (title: string, currentCaption: string, platform: string) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Bertindaklah sebagai Copywriter Profesional Media Sosial. 
      Judul Konten: ${title}
      Platform: ${platform}
      Draft Caption Saat Ini: ${currentCaption}
      
      Tolong optimalkan caption ini agar lebih menarik (hook yang kuat), berikan 3 opsi variasi (Lucu, Profesional, To-the-point) lengkap dengan hashtag yang relevan.`,
    });
    // The .text property is a getter that returns the extracted string output.
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Gagal mengoptimasi caption. Silakan coba lagi.";
  }
};
