import axios from 'axios';
import { Model } from './models';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get API key from environment variables
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

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
      const prompt = `Continue the following text with ONLY ONE SINGLE WORD. You may include appropriate punctuation if needed (like commas, periods, etc.) but no more than one word. The word should make sense in the context of the story.
      
Current text: "${this.currentText}"

Next word:`;

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
            'X-Title': 'One Word At A Time'
          }
        }
      );

      // Extract the completion text from the response
      let completionText = '';
      if (response.data.choices && response.data.choices.length > 0) {
        completionText = response.data.choices[0].message.content || '';
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