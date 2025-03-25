# One Word At A Time (OWAAT)

A command-line tool that has multiple LLM models take turns to generate a story, one word at a time. Each model has its own color in the output.

## How it Works

This tool connects to various AI language models (LLMs). Each model contributes one word to a collaborative story, with each model's contributions shown in a unique color.

## Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/owaat.git
cd owaat

# Install dependencies
npm install

# Create a .env file with your OpenRouter API key
echo "OPENROUTER_API_KEY=your_api_key_here" > .env
```

## Usage

```bash
# Run with default settings
npm run start

# Run with custom initial text
INITIAL_TEXT="Once upon a time" npm run start

# Run with THE_END option enabled
THE_END=1 npm run start

# Combine options
INITIAL_TEXT="In a galaxy far, far away" THE_END=1 npm run start
```

## Configuration

You can customize the application by modifying these files:

- `src/models.ts` - Add/remove models or change their colors
- `src/index.ts` - Adjust settings like word count and delay between words

### Environment Variables

- `OPENROUTER_API_KEY` (required) - Your API key for accessing the models
- `THE_END=1` (optional) - Enable models to end the story with "THE END." when they think it has reached a natural conclusion
- `INITIAL_TEXT="Once upon a time"` (optional) - Provide the initial text to start the story

## Features

- Uses real LLMs to generate content
- Each model has a distinctive color
- Random model selection for who goes first
- Appropriate punctuation in the generated story
- Story length of up to 100 words
- Optional story ending feature (with THE_END=1)
- Custom story starting point (with INITIAL_TEXT)
- Modular architecture for easy customization

## Requirements

- Node.js
- An API key for accessing the LLM models

## License

ISC