
import { GoogleGenAI } from "@google/genai";

// Use gemini-3-flash-preview for simple text tasks and Q&A explanations.
export const getTutorExplanation = async (topic: string, question: string, selectedAnswer: string, isCorrect: boolean) => {
  try {
    // Create instance inside the function to ensure we always use the latest process.env.API_KEY
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a friendly teacher for a rural student. 
      Topic: ${topic}
      Question: ${question}
      The student chose: ${selectedAnswer}. 
      This answer was ${isCorrect ? 'Correct' : 'Incorrect'}.
      Explain why in one or two simple sentences using helpful analogies.`,
      config: {
        // Removed maxOutputTokens to follow guidelines recommending to avoid setting it if not required.
        temperature: 0.7,
      }
    });
    
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return null;
  }
};

// Use gemini-3-flash-preview for multimodal tasks like transcription.
export const transcribeVoiceAnswer = async (audioBase64: string) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { mimeType: 'audio/wav', data: audioBase64 } },
          { text: "Transcribe the student's answer precisely. If it's a number, return the digit." }
        ]
      }
    });
    
    return response.text?.trim() || null;
  } catch (error) {
    console.error("Transcription Error:", error);
    return null;
  }
};
