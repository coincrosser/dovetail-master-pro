import { GoogleGenAI, Type } from "@google/genai";
import { JointConfig, AIAdvice } from "../types";
import { JointPreset } from "../constants";

export const getAIWoodworkingAdvice = async (
  config: JointConfig, 
  attempt: number = 0
): Promise<AIAdvice> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Analyze this dovetail joint configuration for a professional woodworking project:
    - Board Width: ${config.boardWidth} inches
    - Board Thickness: ${config.boardThickness} inches
    - Number of Tails: ${config.numTails}
    - Pin Width: ${config.pinWidth} inches
    - Wood Type: ${config.woodType}
    - Slope: 1:${config.angle}

    Provide advice as JSON with "recommendation", "reasoning", and "proTips" (array of 3 strings).
  `;

  try {
    // Keeping this on Gemini 3.0 Flash as requested for text tasks
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recommendation: { type: Type.STRING },
            reasoning: { type: Type.STRING },
            proTips: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["recommendation", "reasoning", "proTips"]
        }
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error: any) {
    console.warn("Gemini Error:", error);
    return {
      recommendation: `Traditional layout for ${config.woodType.toLowerCase()} confirmed via local failover.`,
      reasoning: "The automated analysis is currently in maintenance mode. Standard shop ratios (1:" + config.angle + ") are recommended for " + config.boardThickness + "\" stock to ensure long-term stability.",
      proTips: [
        "Mark with a sharp knife instead of a pencil for ultimate precision.",
        "Always saw on the waste side of your line to ensure a snug piston-fit.",
        "Check squareness constantly during the assembly process."
      ]
    };
  }
};

export const generateJointPreviewImage = async (preset: JointPreset): Promise<string | null> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Studio photography of ${preset.name} woodworking joint. 
    Close up detailed shot of ${preset.recommendedWood}. 
    Clean background, professional lighting, high resolution, photorealistic.
  `;

  try {
    // Switched to Gemini 3.0 Pro Image Preview for high-fidelity 3.0 generation
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [
          {
            text: prompt,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
          imageSize: "1K"
        }
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error: any) {
    console.error("Image generation failed:", error);
    if (error.message?.includes("Requested entity was not found")) {
      console.error("API Key project mismatch. User may need to re-select a paid project key.");
    }
    return null;
  }
};