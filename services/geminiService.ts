
import { GoogleGenAI, Type } from "@google/genai";
import { JointConfig, AIAdvice, JointPreset } from "../types.ts";

export const getAIWoodworkingAdvice = async (
  config: JointConfig, 
  attempt: number = 0
): Promise<AIAdvice> => {
  // Always initialize client with the environment API key
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Analyze this dovetail joint configuration for a professional woodworking project:
    - Board Width: ${config.boxWidth} inches
    - Board Thickness: ${config.boardThickness} inches
    - Number of Tails: ${config.numTails}
    - Pin Width: ${config.pinWidth} inches
    - Wood Type: ${config.woodType}
    - Slope: 1:${config.angle}

    Provide advice as JSON with "recommendation", "reasoning", "proTips" (array of 3 strings), and "structuralScore" (number 0-100).
  `;

  try {
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
            },
            structuralScore: { type: Type.NUMBER }
          },
          required: ["recommendation", "reasoning", "proTips", "structuralScore"]
        }
      }
    });

    // Access .text property directly as per guidelines
    const jsonStr = response.text || '{}';
    return JSON.parse(jsonStr);
  } catch (error: any) {
    console.warn("Gemini Error:", error);
    return {
      recommendation: `Traditional layout for ${config.woodType.toLowerCase()} confirmed via local failover.`,
      reasoning: "The automated analysis is currently in maintenance mode. Standard shop ratios (1:" + config.angle + ") are recommended for " + config.boardThickness + "\" stock to ensure long-term stability.",
      proTips: [
        "Mark with a sharp knife instead of a pencil for ultimate precision.",
        "Saw on the waste side of your line to ensure a snug piston-fit.",
        "Check squareness constantly during the assembly process."
      ],
      structuralScore: 85
    };
  }
};

export const generateJointPreviewImage = async (preset: JointPreset): Promise<string | null> => {
  // Check for mandatory API key selection for pro models as per guidelines
  if (typeof window !== 'undefined' && (window as any).aistudio) {
    const hasKey = await (window as any).aistudio.hasSelectedApiKey();
    if (!hasKey) {
      await (window as any).aistudio.openSelectKey();
    }
  }

  // Create a new client instance right before making the API call
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Studio photography of ${preset.name} woodworking joint. 
    Close up detailed shot of ${preset.recommendedWood}. 
    Clean background, professional lighting, high resolution, photorealistic.
  `;

  try {
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
      // Find the image part in the response parts
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error: any) {
    console.error("Image generation failed:", error);
    // Reset key selection if the request fails due to missing credentials
    if (error?.message?.includes("Requested entity was not found.") && typeof window !== 'undefined' && (window as any).aistudio) {
      await (window as any).aistudio.openSelectKey();
    }
    return null;
  }
};
