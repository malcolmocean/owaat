#!/usr/bin/env node

import chalk from 'chalk';
import { models, humanModel } from './models';
import { WordGenerator } from './generator';
import * as dotenv from 'dotenv';
import * as readlineSync from 'readline-sync';
const notifier = require('node-notifier');

// Load environment variables
dotenv.config();

// Configuration
const MAX_WORD_COUNT = 100; // Maximum number of words to generate
const DELAY_MS = 800;  // Delay between words in milliseconds
const ENABLE_THE_END = process.env.THE_END === '1';
const INITIAL_TEXT = process.env.INITIAL_TEXT || '';
const VERBOSE = process.env.VERBOSE === '1';
const ENABLE_HUMAN = process.env.HUMAN === '1';

/**
 * Main function to run the one-word-at-a-time generator
 */
async function main() {
  console.log(chalk.bold('One Word At A Time'));
  console.log(chalk.dim('Each model contributes one word to build a collaborative story.'));
  if (ENABLE_THE_END) {
    console.log(chalk.dim('Models can end the story with "THE END." when appropriate.'));
  }
  if (VERBOSE) {
    console.log(chalk.dim('VERBOSE mode: Showing full prompts and responses.'));
  }
  if (ENABLE_HUMAN) {
    console.log(chalk.dim('HUMAN mode: You will take turns with the AI models.'));
  }
  
  // Display the models with their colors on one line
  process.stdout.write(chalk.bold('Models: '));
  
  // Create a list of models to display
  const displayModels = [...models];
  if (ENABLE_HUMAN) {
    displayModels.push(humanModel);
  }
  
  displayModels.forEach((model, index) => {
    process.stdout.write(`${model.colorFn('■')} ${model.name}${index < displayModels.length - 1 ? '    ' : ''}`);
  });
  console.log();
  console.log();
  
  // Shuffle the models array to randomize which model goes first
  let shuffledModels = [...models].sort(() => Math.random() - 0.5);
  
  // Add human to models list if enabled
  if (ENABLE_HUMAN) {
    // Insert human at a random position
    const humanIndex = Math.floor(Math.random() * (shuffledModels.length + 1));
    shuffledModels.splice(humanIndex, 0, humanModel);
  }
  
  // Initialize the generator with shuffled models and initial text
  const generator = new WordGenerator(shuffledModels, INITIAL_TEXT);
  
  // Generate words one at a time
  console.log(chalk.bold('Generated Story:'));
  
  // Display initial text information if provided
  if (INITIAL_TEXT) {
    console.log(chalk.dim(`Starting with: "${INITIAL_TEXT}"`));
  }
  
  let wordCount = 0;
  let isStoryEnded = false;
  let nextWord: string | null;
  
  // Buffer to hold the current display state
  let displayBuffer = '';
  if (INITIAL_TEXT) {
    // Format the initial text with white color
    displayBuffer = chalk.white(INITIAL_TEXT + ' ');
  }
  
  // Start the story
  process.stdout.write(displayBuffer);
  
  while (wordCount < MAX_WORD_COUNT && !isStoryEnded) {
    const currentModel = generator.getCurrentModel();
    
    // If it's human's turn
    if (currentModel.isHuman) {
      // Visual indicator for human's turn
      process.stdout.write(humanModel.colorFn('■ ')); 
      
      // Notify the user it's their turn
      if (process.stdout.isTTY) {
        notifier.notify({
          title: 'One Word At A Time',
          message: "It's your turn to add a word!",
          sound: true
        });
      }
      
      // Get human input directly
      const humanWord = readlineSync.question('', {
        limit: /^.+$/,
        limitMessage: 'Please enter a word'
      }).trim();
      
      let processedWord = humanWord;
      
      // Validate - ensure it's just one word unless it's THE END
      if (processedWord !== "THE END." && 
          processedWord !== "THE END" && 
          processedWord.split(/\s+/).length > 1) {
        console.log(chalk.yellow('\nPlease enter only one word. Using the first word.'));
        processedWord = processedWord.split(/\s+/)[0];
      }
      
      // Check for ending the story
      if (ENABLE_THE_END && (processedWord.toUpperCase() === "THE END." || processedWord.toUpperCase() === "THE END")) {
        nextWord = "THE END.";
        
        // Update the story text
        if (generator.getCurrentText()) {
          generator.appendText(" THE END.");
        }
        
        // Update display
        process.stdout.write('\b\b'); // Remove the blue square
        process.stdout.write(humanModel.colorFn('THE END.'));
        isStoryEnded = true;
      } else {
        // Send the human word to the generator and get processed word back
        nextWord = await generator.generateNextWord(processedWord);
        
        // Update display - remove the blue square and show the word
        process.stdout.write('\b\b'); // Remove the blue square
        process.stdout.write(humanModel.colorFn(nextWord + ' '));
        wordCount++;
      }
    } else {
      // AI model's turn - show the thinking indicator
      process.stdout.write(currentModel.colorFn('■ '));
      
      // Get the next word from the model
      nextWord = await generator.generateNextWord();
      
      // Check if the story is ending
      if (nextWord === 'THE END.') {
        // Remove the thinking indicator
        process.stdout.write('\b\b');
        
        // Show the end
        process.stdout.write(currentModel.colorFn(nextWord));
        isStoryEnded = true;
      } else {
        // Remove the thinking indicator
        process.stdout.write('\b\b');
        
        // Display the word with the model's color
        process.stdout.write(currentModel.colorFn(nextWord + ' '));
        wordCount++;
      }
      
      // Add a small delay before the next turn
      await new Promise(resolve => setTimeout(resolve, DELAY_MS));
    }
  }
  
  console.log('\n');
  console.log(chalk.bold('Final Story:'));
  console.log(generator.getCurrentText());
}

// Run the main function
main().catch(error => {
  console.error(chalk.red('Error:'), error.message);
  process.exit(1);
});
