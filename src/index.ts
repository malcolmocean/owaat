#!/usr/bin/env node

import chalk from 'chalk';
import { models } from './models';
import { WordGenerator } from './generator';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Configuration
const MAX_WORD_COUNT = 100; // Maximum number of words to generate
const DELAY_MS = 800;  // Delay between words in milliseconds
const ENABLE_THE_END = process.env.THE_END === '1';

/**
 * Main function to run the one-word-at-a-time generator
 */
async function main() {
  console.log(chalk.bold('One Word At A Time'));
  console.log(chalk.dim('Each model contributes one word to build a collaborative story.'));
  if (ENABLE_THE_END) {
    console.log(chalk.dim('Models can end the story with "THE END." when appropriate.'));
  }
  console.log();
  
  // Display the models with their colors on one line
  process.stdout.write(chalk.bold('Models: '));
  models.forEach((model, index) => {
    process.stdout.write(`${model.colorFn('■')} ${model.name}${index < models.length - 1 ? '    ' : ''}`);
  });
  console.log();
  console.log();
  
  // Shuffle the models array to randomize which model goes first
  const shuffledModels = [...models].sort(() => Math.random() - 0.5);
  
  // Initialize the generator with shuffled models
  const generator = new WordGenerator(shuffledModels);
  
  // Generate words one at a time
  console.log(chalk.bold('Generated Story:'));
  process.stdout.write(''); // Start a new line
  
  let wordCount = 0;
  let isStoryEnded = false;
  
  while (wordCount < MAX_WORD_COUNT && !isStoryEnded) {
    const currentModel = generator.getCurrentModel();
    const nextWord = await generator.generateNextWord();
    
    // Check if the story is ending
    if (nextWord === 'THE END.') {
      isStoryEnded = true;
      process.stdout.write(currentModel.colorFn(nextWord));
    } else {
      // Display the word with the model's color
      process.stdout.write(currentModel.colorFn(nextWord + ' '));
      wordCount++;
    }
    
    // Add a small delay for a more interactive experience
    await new Promise(resolve => setTimeout(resolve, DELAY_MS));
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
