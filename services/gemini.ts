
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getTutorExplanation = async (topic: string, question: string, selectedAnswer: string, isCorrect: boolean) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a friendly teacher for a rural student. 
      Topic: ${topic}
      Question: ${question}
      The student chose: ${selectedAnswer}. 
      This answer was ${isCorrect ? 'Correct' : 'Incorrect'}.
      Explain why in one or two simple sentences using helpful analogies.`,
      config: {
        maxOutputTokens: 150,
        temperature: 0.7,
      }
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return null;
  }
};

export const transcribeVoiceAnswer = async (audioBase64: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { mimeType: 'audio/wav', data: audioBase64 } },
          { text: "Transcribe the student's answer precisely. If it's a number, return the digit." }
        ]
      }
    });
    return response.text?.trim();
  } catch (error) {
    console.error("Transcription Error:", error);
    return null;
  }
};
