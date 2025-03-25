#!/usr/bin/env node

import chalk from 'chalk';
import { models } from './models';
import { WordGenerator } from './generator';

// Configuration
const WORD_COUNT = 30; // Total number of words to generate
const DELAY_MS = 800;  // Delay between words in milliseconds

/**
 * Main function to run the one-word-at-a-time generator
 */
async function main() {
  console.log(chalk.bold('One Word At A Time - OpenRouter Edition'));
  console.log(chalk.dim('Each model contributes one word to build a collaborative story.'));
  console.log(chalk.dim('Using various models from OpenRouter.ai'));
  console.log();
  
  // Display the models with their colors
  console.log(chalk.bold('Models:'));
  models.forEach(model => {
    console.log(`${model.colorFn('■')} ${model.name}`);
  });
  console.log();
  
  // Initialize the generator
  const generator = new WordGenerator(models);
  
  // Generate words one at a time
  console.log(chalk.bold('Generated Story:'));
  process.stdout.write(''); // Start a new line
  
  for (let i = 0; i < WORD_COUNT; i++) {
    const currentModel = generator.getCurrentModel();
    const nextWord = await generator.generateNextWord();
    
    // Display the word with the model's color
    process.stdout.write(currentModel.colorFn(nextWord + ' '));
    
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
