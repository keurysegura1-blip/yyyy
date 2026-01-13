
import { GoogleGenAI, Type } from "@google/genai";
import { GameState } from "../types";

export const analyzeGame = async (state: GameState) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const totalA = state.rounds.reduce((acc, r) => acc + r.pointsA, 0);
  const totalB = state.rounds.reduce((acc, r) => acc + r.pointsB, 0);
  
  const prompt = `Analyze this futuristic domino match:
    Team A (${state.teamAName}): ${totalA} points.
    Team B (${state.teamBName}): ${totalB} points.
    Target score to win: ${state.winningScore}.
    History of rounds (A vs B): ${state.rounds.map(r => `${r.pointsA}-${r.pointsB}`).join(', ')}.
    
    Provide a strategic summary, a prediction of who will win based on the momentum, and 3 futuristic tactical tips for the losing team.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING, description: "Short overall match status" },
            prediction: { type: Type.STRING, description: "Predicted winner with justification" },
            tips: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "3 tactical advice pieces" 
            }
          },
          required: ["summary", "prediction", "tips"]
        }
      }
    });

    return JSON.parse(response.text) as {
      summary: string;
      prediction: string;
      tips: string[];
    };
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return null;
  }
};
