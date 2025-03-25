# One Word At A Time (OWAAT)

A command-line tool that simulates multiple LLM models taking turns to generate a story, one word at a time. Each model has its own color in the output.

## How it Works

This tool uses the OpenRouter API to access various AI language models (LLMs). Each model contributes one word to a collaborative story, with each model's contributions shown in a unique color.

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
# Run the application
npm run start
```

## Configuration

You can customize the application by modifying these files:

- `src/models.ts` - Add/remove models or change their colors
- `src/index.ts` - Adjust settings like word count and delay between words

## Features

- Uses real LLMs via OpenRouter API
- Each model has a distinctive color
- Fallback mechanism if API calls fail
- Modular architecture for easy customization

## Requirements

- Node.js
- An OpenRouter API key (https://openrouter.ai)

## License

ISC