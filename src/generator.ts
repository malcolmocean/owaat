import axios from 'axios';
import { Model } from './models';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get API key from environment variables
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const ENABLE_THE_END = process.env.THE_END === '1';

if (!OPENROUTER_API_KEY) {
  console.error('Error: OPENROUTER_API_KEY is not set in the .env file');
  process.exit(1);
}

export class WordGenerator {
  private currentText: string = '';
  private turn: number = 0;
  private models: Model[];
  
  constructor(models: Model[]) {
    this.models = models;
  }

  /**
   * Gets the current model whose turn it is to generate a word
   */
  getCurrentModel(): Model {
    return this.models[this.turn % this.models.length];
  }

  /**
   * Extracts a single word from an LLM response
   * Allows punctuation where appropriate
   */
  private extractWord(text: string): string {
    // Remove any leading/trailing whitespace
    const trimmed = text.trim();
    
    // Split by whitespace and get the first word
    let words = trimmed.split(/\s+/);
    
    // If we have multiple words, just return the first one
    let word = words[0] || '';
    
    // If the word is empty, return empty string to trigger model failure handling
    if (!word) {
      return '';
    }
    
    return word;
  }

  /**
   * Uses OpenRouter API to generate the next word based on current text
   */
  async generateNextWord(): Promise<string> {
    const currentModel = this.getCurrentModel();
    
    try {
      // Construct a prompt asking for a single word continuation
      let prompt = `Continue the following text with ONLY ONE SINGLE WORD as it would naturally appear in the sentence. Include ONLY punctuation that would be PART of the sentence structure - like commas, periods, quote marks, etc. only if grammatically needed at this point in the sentence. Do not add any explanatory text or extra words.
      
Current text: "${this.currentText}"

Next word:`;
      
      // Add THE END instruction if enabled
      if (ENABLE_THE_END) {
        prompt = `Continue the following text with ONLY ONE SINGLE WORD as it would naturally appear in the sentence. Include ONLY punctuation that would be PART of the sentence structure - like commas, periods, quote marks, etc. only if grammatically needed at this point in the sentence. Do not add any explanatory text or extra words.

If you think the story has reached a natural conclusion, you may respond with exactly "THE END." to finish the story.
      
Current text: "${this.currentText}"

Next word:`;
      }

      // Call the OpenRouter API
      const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: currentModel.id,
          messages: [
            { role: 'user', content: prompt }
          ],
          max_tokens: 10, // Limit the response size
          temperature: 0.7,
        },
        {
          headers: {
            'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
            'HTTP-Referer': 'https://github.com/yourusername/owaat',
            'X-Title': 'One Word At A Time Story Generator'
          }
        }
      );

      // Extract the completion text from the response
      let completionText = '';
      if (response.data.choices && response.data.choices.length > 0) {
        completionText = response.data.choices[0].message.content || '';
      }
      
      // Check for "THE END." marker if enabled
      if (ENABLE_THE_END && completionText.trim() === "THE END.") {
        // Add "THE END." to the current text
        this.currentText += " THE END.";
        return "THE END.";
      }
      
      // Extract a single word from the completion
      let nextWord = this.extractWord(completionText);
      
      // Update the current text
      if (this.currentText === '') {
        // Capitalize the first word
        nextWord = nextWord.charAt(0).toUpperCase() + nextWord.slice(1);
        this.currentText = nextWord;
      } else {
        // Add space before adding the new word
        this.currentText += ' ' + nextWord;
      }
      
      // Move to the next model's turn
      this.turn++;
      
      return nextWord;
    } catch (error) {
      console.error(`Error calling ${currentModel.name} API:`, error);
      
      // Move to the next model
      this.turn++;
      
      // Try all models before giving up
      if (this.models.every((_, index) => index + this.turn % this.models.length >= this.models.length)) {
        throw new Error("All models failed to generate a word. The application cannot continue.");
      }
      
      // Recursively try the next model
      return this.generateNextWord();
    }
  }
  
  /**
   * Gets the full text generated so far
   */
  getCurrentText(): string {
    return this.currentText;
  }
}