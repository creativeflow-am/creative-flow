
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
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Gagal mengoptimasi caption. Silakan coba lagi.";
  }
};

export const generateDraft = async (title: string, platform: string) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Bertindaklah sebagai Digital Content Strategist. Buatlah 1 draft caption media sosial yang sangat menarik untuk:
      Judul/Topik: ${title}
      Platform: ${platform}
      
      Ketentuan:
      1. Berikan hook yang mencuri perhatian di kalimat pertama.
      2. Berikan isi yang informatif namun ringkas.
      3. Berikan Call to Action (CTA) di akhir.
      4. Tambahkan 3-5 hashtag relevan.
      
      Langsung berikan caption-nya saja tanpa pengantar.`,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Generate Error:", error);
    return "Gagal membuat draf otomatis. Silakan isi secara manual.";
  }
};
