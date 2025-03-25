import axios from 'axios';
import { Model } from './models';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get environment variables
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const ENABLE_THE_END = process.env.THE_END === '1';
const VERBOSE = process.env.VERBOSE === '1';

if (!OPENROUTER_API_KEY) {
  console.error('Error: OPENROUTER_API_KEY is not set in the .env file');
  process.exit(1);
}

export class WordGenerator {
  private currentText: string = '';
  private turn: number = 0;
  private models: Model[];
  
  constructor(models: Model[], initialText: string = '') {
    this.models = models;
    
    // Set the initial text if provided
    if (initialText) {
      this.currentText = initialText;
    }
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
   * If the current model is human, returns null to signal human input is needed
   */
  async generateNextWord(humanWord?: string): Promise<string | null> {
    const currentModel = this.getCurrentModel();
    
    // If it's the human's turn and no word is provided, signal to get human input
    if (currentModel.isHuman && !humanWord) {
      return null;
    }
    
    // If human input was provided, use it
    if (currentModel.isHuman && humanWord) {
      // Update the current text
      if (this.currentText === '') {
        // Capitalize the first word
        humanWord = humanWord.charAt(0).toUpperCase() + humanWord.slice(1);
        this.currentText = humanWord;
      } else {
        // Add space before adding the new word
        this.currentText += ' ' + humanWord;
      }
      
      // Move to the next model's turn
      this.turn++;
      
      return humanWord;
    }
    
    try {
      // Base prompt instructions
      let instructions = `Continue the following text with ONLY ONE SINGLE WORD as it would naturally appear in the sentence. Include ONLY punctuation that would be PART of the sentence structure - like commas, periods, quote marks, etc. only if grammatically needed at this point in the sentence. Do not add any explanatory text or extra words.`;
      
      // Add THE END instruction if enabled
      if (ENABLE_THE_END) {
        instructions += `\n\nIf you think the story has reached a natural conclusion, you may respond with exactly "THE END." to finish the story.`;
      }
      
      // Construct the full prompt
      const prompt = `${instructions}
      
Current text:
${this.currentText}

Next word:`;

      // Prepare the request payload
      const payload = {
        model: currentModel.id,
        messages: [
          { role: 'user', content: prompt }
        ],
        max_tokens: 10, // Limit the response size
        temperature: 0.7,
      };
      
      // Log the prompt in verbose mode
      if (VERBOSE) {
        console.log('\n');
        console.log('=====================================================');
        console.log(`Model: ${currentModel.name} (${currentModel.id})`);
        console.log(`THE_END mode: ${ENABLE_THE_END ? 'Enabled' : 'Disabled'}`);
        console.log('-----------------------------------------------------');
        console.log('Prompt:');
        console.log(prompt);
        console.log('-----------------------------------------------------');
      }
      
      // Call the OpenRouter API
      const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        payload,
        {
          headers: {
            'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
            'HTTP-Referer': 'https://github.com/yourusername/owaat',
            'X-Title': 'One Word At A Time Story Generator'
          }
        }
      );
      
      // Log the response in verbose mode
      if (VERBOSE) {
        console.log('Response:');
        if (response.data.choices && response.data.choices.length > 0) {
          console.log(`Raw response: "${response.data.choices[0].message.content}"`);
        } else {
          console.log('No content returned');
        }
        
        // Show token usage if available
        if (response.data.usage) {
          console.log(`Tokens: ${response.data.usage.prompt_tokens} prompt, ${response.data.usage.completion_tokens} completion, ${response.data.usage.total_tokens} total`);
        }
        
        console.log('=====================================================');
      }

      // Extract the completion text from the response
      let completionText = '';
      if (response.data.choices && response.data.choices.length > 0) {
        completionText = response.data.choices[0].message.content || '';
      }
      
      // Check for "THE END." marker if enabled
      if (ENABLE_THE_END && completionText.trim() === "THE END.") {
        // Log the end detection in verbose mode
        if (VERBOSE) {
          console.log('Detected "THE END." response - story will end');
        }
        
        // Add "THE END." to the current text
        this.currentText += " THE END.";
        return "THE END.";
      }
      
      // Extract a single word from the completion
      let nextWord = this.extractWord(completionText);
      
      // Log the extracted word in verbose mode
      if (VERBOSE) {
        console.log(`Extracted word: "${nextWord}"`);
      }
      
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
  
  /**
   * Directly append text to the current text
   */
  appendText(text: string): void {
    this.currentText += text;
  }
}