import { GoogleGenAI, Type } from "@google/genai";
import { Perspectives, Synthesis, Weights } from "../types";
import { BATCH_PERSPECTIVES_PROMPT, SYNTHESIS_PROMPT } from "../constants";

export class GeminiService {
  private getAI() {
    return new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  }

  private handleError(error: any): Error {
    console.error("Gemini API Error:", error);
    let message = "An unexpected error occurred while communicating with the AI.";
    
    if (error.message) {
      if (error.message.includes("429") || error.message.toLowerCase().includes("quota") || error.message.toLowerCase().includes("rate limit")) {
        message = "Rate limit exceeded (429). The AI service is currently busy. Please wait 30-60 seconds before trying again.";
      } else if (error.message.includes("403") || error.message.toLowerCase().includes("permission")) {
        message = "Access denied (403). Your API key might not have permission for this model or region.";
      } else if (error.message.includes("400") || error.message.toLowerCase().includes("invalid")) {
        message = "Schema validation failed (400). The structured output definition was rejected by the model.";
      } else if (error.message.includes("500") || error.message.includes("503")) {
        message = "AI Service Error (5xx). Google's servers are experiencing issues. Please try again later.";
      } else if (error.message.toLowerCase().includes("api key")) {
        message = "API Key Error. Please ensure a valid Google GenAI API key is configured.";
      } else {
        message = error.message;
      }
    }
    
    return new Error(message);
  }

  async analyzePerspectives(problem: string, context: string): Promise<Perspectives> {
    try {
      const ai = this.getAI();
      const prompt = BATCH_PERSPECTIVES_PROMPT
        .replace('{problem}', problem)
        .replace('{context}', context);

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              security: this.getPerspectiveSchema(),
              performance: this.getPerspectiveSchema(),
              cost: this.getPerspectiveSchema(),
              developer: this.getPerspectiveSchema(),
              business: this.getPerspectiveSchema(),
            },
            required: ["security", "performance", "cost", "developer", "business"]
          }
        }
      });

      if (!response || !response.text) {
        throw new Error("Received an empty response from the AI.");
      }

      return JSON.parse(response.text);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async synthesize(problem: string, perspectives: Perspectives, weights: Weights): Promise<Synthesis> {
    try {
      const ai = this.getAI();
      const prompt = SYNTHESIS_PROMPT
        .replace('{problem}', problem)
        .replace('{perspectives_json}', JSON.stringify(perspectives))
        .replace('{weights_json}', JSON.stringify(weights));

      const response = await ai.models.generateContent({
        model: "gemini-3-pro-preview",
        contents: prompt,
        config: {
          thinkingConfig: { thinkingBudget: 4000 },
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              final_recommendation: { type: Type.STRING },
              confidence: { type: Type.INTEGER },
              reasoning_chain: { type: Type.ARRAY, items: { type: Type.STRING } },
              consensus_points: { type: Type.ARRAY, items: { type: Type.STRING } },
              conflicts_resolved: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    conflict: { type: Type.STRING },
                    resolution: { type: Type.STRING },
                    tradeoff: { type: Type.STRING }
                  }
                }
              },
              action_plan: { type: Type.ARRAY, items: { type: Type.STRING } },
              outcomes: {
                type: Type.OBJECT,
                properties: {
                  security: { type: Type.STRING },
                  performance: { type: Type.STRING },
                  cost: { type: Type.STRING },
                  developer: { type: Type.STRING },
                  business: { type: Type.STRING }
                }
              }
            },
            required: ["final_recommendation", "confidence", "reasoning_chain", "conflicts_resolved", "action_plan", "outcomes"]
          }
        }
      });

      if (!response || !response.text) {
        throw new Error("Received an empty response during synthesis.");
      }

      return JSON.parse(response.text);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private getPerspectiveSchema() {
    return {
      type: Type.OBJECT,
      properties: {
        recommendation: { type: Type.STRING },
        confidence: { type: Type.INTEGER },
        reasoning: { type: Type.STRING },
        key_points: { type: Type.ARRAY, items: { type: Type.STRING } },
        metrics: { 
          type: Type.ARRAY, 
          items: {
            type: Type.OBJECT,
            properties: {
              label: { type: Type.STRING },
              value: { type: Type.STRING }
            },
            required: ["label", "value"]
          }
        }
      },
      required: ["recommendation", "confidence", "reasoning", "key_points", "metrics"]
    };
  }
}