
import { GoogleGenAI, Type, Modality, GenerateContentResponse, LiveServerMessage } from "@google/genai";
import { ChatMessage, AspectRatio, ImageSize } from "../types";

const SYSTEM_INSTRUCTION = `You are a world-class AI Infrastructure Architect expert on Azure, Kubernetes, and Docker. 
You are helping a user explore a specific project architecture: "AI Infrastructure Architecture: Azure Machine Learning with Docker, Kubernetes & Grafana Monitoring".

Key Architecture details:
- Model Serving: Azure Kubernetes Service (AKS) with Docker.
- Model Management: Azure Machine Learning (AML) with MLflow and Pipelines.
- Storage: Data Lake, Blob Storage, Cosmos DB.
- Monitoring: Grafana, Prometheus, Azure Monitor.
- CI/CD: Azure DevOps Pipelines.
- Security: Key Vault, Private Clusters, Managed Identity.

Focus on technical accuracy and best practices.`;

export class GeminiService {
  constructor() {}

  private getAI() {
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  /**
   * Complex Chat with Thinking Mode and Grounding
   */
  async sendMessage(
    message: string, 
    useThinking: boolean = false, 
    useSearch: boolean = false, 
    useMaps: boolean = false,
    useLowLatency: boolean = false
  ) {
    const ai = this.getAI();
    let model = useLowLatency ? 'gemini-2.5-flash-lite-latest' : 'gemini-3-pro-preview';
    
    const tools: any[] = [];
    if (useSearch) {
      model = 'gemini-3-flash-preview';
      tools.push({ googleSearch: {} });
    }
    if (useMaps) {
      model = 'gemini-2.5-flash';
      tools.push({ googleMaps: {} });
    }

    const config: any = {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.7,
      tools: tools.length > 0 ? tools : undefined,
    };

    if (useThinking && model === 'gemini-3-pro-preview') {
      config.thinkingConfig = { thinkingBudget: 32768 };
    }

    try {
      const response = await ai.models.generateContent({
        model,
        contents: [{ role: 'user', parts: [{ text: message }] }],
        config,
      });

      return {
        text: response.text || "No response generated.",
        groundingMetadata: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
      };
    } catch (error) {
      console.error("Gemini Chat Error:", error);
      throw error;
    }
  }

  /**
   * High-Quality Image Generation (Gemini 3 Pro Image)
   */
  async generateImage(prompt: string, aspectRatio: AspectRatio = "1:1", imageSize: ImageSize = "1K") {
    const ai = this.getAI();
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: { parts: [{ text: prompt }] },
        config: {
          imageConfig: { aspectRatio, imageSize }
        }
      });

      const imagePart = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
      if (imagePart?.inlineData) {
        return `data:image/png;base64,${imagePart.inlineData.data}`;
      }
      throw new Error("No image generated.");
    } catch (error) {
      console.error("Image Gen Error:", error);
      throw error;
    }
  }

  /**
   * Edit Images (Gemini 2.5 Flash Image)
   */
  async editImage(base64Image: string, prompt: string) {
    const ai = this.getAI();
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            { inlineData: { data: base64Image.split(',')[1], mimeType: 'image/png' } },
            { text: prompt }
          ]
        }
      });
      const imagePart = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
      if (imagePart?.inlineData) {
        return `data:image/png;base64,${imagePart.inlineData.data}`;
      }
      return null;
    } catch (error) {
      console.error("Image Edit Error:", error);
      throw error;
    }
  }

  /**
   * Generate Videos (Veo)
   */
  async generateVideo(prompt: string, base64Image?: string, aspectRatio: '16:9' | '9:16' = '16:9') {
    const ai = this.getAI();
    try {
      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt,
        image: base64Image ? {
          imageBytes: base64Image.split(',')[1],
          mimeType: 'image/png'
        } : undefined,
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio
        }
      });

      while (!operation.done) {
        await new Promise(r => setTimeout(r, 10000));
        operation = await ai.operations.getVideosOperation({ operation });
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
      const blob = await response.blob();
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error("Video Gen Error:", error);
      throw error;
    }
  }

  /**
   * Text-To-Speech (Gemini 2.5 Flash Preview TTS)
   */
  async generateSpeech(text: string, voiceName: string = 'Kore') {
    const ai = this.getAI();
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      return base64Audio;
    } catch (error) {
      console.error("TTS Error:", error);
      throw error;
    }
  }

  /**
   * Live API Connection (Flash Native Audio)
   */
  async connectLive(callbacks: {
    onopen: () => void;
    onmessage: (message: LiveServerMessage) => void;
    onerror: (e: any) => void;
    onclose: (e: any) => void;
  }) {
    const ai = this.getAI();
    return ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-09-2025',
      callbacks,
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
        },
        systemInstruction: SYSTEM_INSTRUCTION,
      },
    });
  }

  /**
   * Media Analysis (Gemini 3 Pro)
   */
  async analyzeMedia(base64Media: string, mimeType: string, prompt: string) {
    const ai = this.getAI();
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: {
          parts: [
            { inlineData: { data: base64Media.split(',')[1], mimeType } },
            { text: prompt }
          ]
        }
      });
      return response.text;
    } catch (error) {
      console.error("Media Analysis Error:", error);
      return "Analysis failed.";
    }
  }
}

export const geminiService = new GeminiService();
