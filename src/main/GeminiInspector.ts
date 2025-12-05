/**
 * GeminiInspector - AI-powered file intelligence using Google Gemini
 * 
 * This class provides tactical analysis of files using the Google Generative AI API.
 * It constructs prompts with file metadata and returns formatted analysis results.
 */

import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { MonsterType } from '../shared/types';

/**
 * Request interface for file inspection
 */
export interface FileInspectionRequest {
  path: string;
  size: number;
  lastModified: Date | string;
  classifications: MonsterType[];
}

/**
 * Response interface for file inspection
 */
export interface FileInspectionResponse {
  analysis: string;
  threat_level: 'low' | 'medium' | 'high';
  recommendations: string[];
  error?: string;
}

/**
 * Formats bytes into human-readable size string
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * GeminiInspector class for AI-powered file analysis
 */
export class GeminiInspector {
  private genAI: GoogleGenerativeAI | null = null;
  private model: GenerativeModel | null = null;
  private apiKey: string;
  private maxRetries: number = 3;
  private retryDelayMs: number = 1000;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.GEMINI_API_KEY || '';
    
    if (this.apiKey) {
      this.initializeClient();
    }
  }

  /**
   * Initialize the Gemini API client
   */
  private initializeClient(): void {
    try {
      this.genAI = new GoogleGenerativeAI(this.apiKey);
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
    } catch (error) {
      console.error('Failed to initialize Gemini API client:', error);
      this.genAI = null;
      this.model = null;
    }
  }

  /**
   * Check if the API client is properly configured
   */
  isConfigured(): boolean {
    return this.genAI !== null && this.model !== null && this.apiKey.length > 0;
  }

  /**
   * Build the inspection prompt with file metadata
   * Ensures all required fields are included for Property 8 compliance
   */
  buildPrompt(request: FileInspectionRequest): string {
    const humanReadableSize = formatBytes(request.size);
    const lastModifiedStr = request.lastModified instanceof Date 
      ? request.lastModified.toISOString() 
      : new Date(request.lastModified).toISOString();
    const classificationsStr = request.classifications.join(', ') || 'none';

    return `You are analyzing a file for The Digital Exorcist, a file management system.

File Details:
- Path: ${request.path}
- Size: ${request.size} bytes (${humanReadableSize})
- Last Modified: ${lastModifiedStr}
- Classifications: ${classificationsStr}

Provide a tactical analysis of this file:
1. What type of file is this likely to be?
2. Why might it be classified as ${classificationsStr}?
3. Is it safe to delete? What are the risks?
4. Recommendation: Keep or Banish?

Keep your response concise (3-4 sentences) and use tactical, thematic language.`;
  }


  /**
   * Parse and format the API response
   * Extracts analysis text and determines threat level
   */
  parseResponse(responseText: string): FileInspectionResponse {
    if (!responseText || responseText.trim().length === 0) {
      return this.getFallbackResponse('Empty response from API');
    }

    // Determine threat level based on keywords in the response
    let threat_level: 'low' | 'medium' | 'high' = 'medium';
    const lowerText = responseText.toLowerCase();
    
    if (lowerText.includes('safe') || lowerText.includes('harmless') || lowerText.includes('low risk')) {
      threat_level = 'low';
    } else if (lowerText.includes('dangerous') || lowerText.includes('critical') || lowerText.includes('high risk') || lowerText.includes('caution')) {
      threat_level = 'high';
    }

    // Extract recommendations from the response
    const recommendations: string[] = [];
    if (lowerText.includes('banish') || lowerText.includes('delete')) {
      recommendations.push('Consider banishing this file to free up space');
    }
    if (lowerText.includes('keep') || lowerText.includes('preserve')) {
      recommendations.push('This file may be worth keeping');
    }
    if (lowerText.includes('backup') || lowerText.includes('archive')) {
      recommendations.push('Consider backing up before deletion');
    }
    if (lowerText.includes('verify') || lowerText.includes('check')) {
      recommendations.push('Verify no active projects reference this file');
    }

    // If no specific recommendations found, add a default
    if (recommendations.length === 0) {
      recommendations.push('Review file contents before taking action');
    }

    return {
      analysis: responseText.trim(),
      threat_level,
      recommendations
    };
  }

  /**
   * Get fallback response when API is unavailable or fails
   */
  getFallbackResponse(errorMessage?: string): FileInspectionResponse {
    return {
      analysis: 'SOUL SIGNATURE OBSCURED - Unable to decipher this entity\'s true nature. The spirits are silent on this matter. Proceed with caution, Exorcist.',
      threat_level: 'medium',
      recommendations: [
        'Manual inspection recommended',
        'Check file extension and location',
        'Verify file is not in active use'
      ],
      error: errorMessage
    };
  }

  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Inspect a file using the Gemini API with retry logic
   */
  async inspectFile(request: FileInspectionRequest): Promise<FileInspectionResponse> {
    // Return fallback if not configured
    if (!this.isConfigured()) {
      return this.getFallbackResponse('Gemini API not configured - missing API key');
    }

    const prompt = this.buildPrompt(request);
    let lastError: Error | null = null;

    // Retry loop with exponential backoff
    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        const result = await this.model!.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        return this.parseResponse(text);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        // Check for rate limiting (429 status)
        const errorMessage = lastError.message.toLowerCase();
        if (errorMessage.includes('429') || errorMessage.includes('rate limit') || errorMessage.includes('quota')) {
          console.warn(`Rate limited on attempt ${attempt + 1}, waiting before retry...`);
          // Exponential backoff: 1s, 2s, 4s
          await this.sleep(this.retryDelayMs * Math.pow(2, attempt));
          continue;
        }

        // For other errors, log and continue to next attempt
        console.error(`Gemini API error on attempt ${attempt + 1}:`, lastError.message);
        
        if (attempt < this.maxRetries - 1) {
          await this.sleep(this.retryDelayMs);
        }
      }
    }

    // All retries exhausted, return fallback
    return this.getFallbackResponse(lastError?.message || 'API request failed after retries');
  }
}

/**
 * Singleton instance for use across the application
 */
let inspectorInstance: GeminiInspector | null = null;

/**
 * Get or create the GeminiInspector singleton
 */
export function getGeminiInspector(): GeminiInspector {
  if (!inspectorInstance) {
    inspectorInstance = new GeminiInspector();
  }
  return inspectorInstance;
}

/**
 * Reset the inspector instance (useful for testing)
 */
export function resetGeminiInspector(): void {
  inspectorInstance = null;
}
