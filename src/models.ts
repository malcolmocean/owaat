import chalk from 'chalk';

export interface Model {
  name: string;
  id: string;
  colorFn: (text: string) => string;
  isHuman?: boolean;
}

// Define simulated models with their display colors
// Instead of calling real APIs, we'll use a mock implementation
export const models: Model[] = [
  { name: 'Claude', id: 'anthropic/claude-3-haiku', colorFn: chalk.cyan },
  { name: 'GPT-4', id: 'openai/gpt-4', colorFn: chalk.green },
  { name: 'Mistral', id: 'mistralai/mistral-large', colorFn: chalk.yellow },
  { name: 'Llama', id: 'meta-llama/llama-3-70b-instruct', colorFn: chalk.red },
  { name: 'Gemini', id: 'google/gemini-pro', colorFn: chalk.magenta },
];

// Human model for interactive mode
export const humanModel: Model = {
  name: 'Human',
  id: 'human',
  colorFn: chalk.bold.blue,
  isHuman: true,
};
