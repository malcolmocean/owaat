# OWAAT Project Guidelines

## Build/Run Commands
- Build: `npm run build` (Compiles TypeScript to JavaScript)
- Run: `npm run start` or `npm run dev` (Runs the application)
- Install dependencies: `npm install`
- Prepublish: `npm run prepublish` (Runs before publishing the package)

## Code Style Guidelines
- **Formatting**: Follow TypeScript strict mode conventions
- **Naming**: camelCase for variables/methods, PascalCase for classes/interfaces
- **Imports**: Group imports by source (built-in, external, internal)
- **Types**: Use TypeScript interfaces (like `Model`), avoid `any` type
- **Error Handling**: Use try/catch blocks with specific error messages and fallbacks
- **Colors**: Use chalk for consistent terminal coloring
- **Environment**: Use dotenv for environment variables (API keys)
- **Comments**: Use JSDoc style for function documentation
- **API Calls**: Use axios for HTTP requests with proper error handling
- **Architecture**: Keep code modular and maintain separation of concerns

Always check for OPENROUTER_API_KEY in .env before making API calls.

## Learnings From Collaboration

### About This Project
1. **Purpose and Architecture**: OWAAT is a fun interactive tool where multiple LLM models take turns generating a story one word at a time. Each model's contributions are shown in a distinct color.

2. **Core Features**:
   - Model coordination with color-coded outputs
   - Random model order selection
   - Proper punctuation handling in generated text
   - Customizable story length (up to 100 words)
   - Optional story ending functionality (THE_END=1)
   - User-defined starting text (INITIAL_TEXT)
   - Verbose mode for debugging/transparency (VERBOSE=1)
   - Fallback mechanism when models fail

3. **Technical Implementation**:
   - OpenRouter API for accessing multiple LLMs
   - Class-based structure that maintains state between generations
   - Careful prompt engineering to get useful single-word responses
   - Environment variables for configuration

4. **Design Decisions**:
   - Preferring model-generated content over fallback word lists
   - Allowing punctuation where grammatically appropriate
   - Handling failures by trying other available models

### About Effective Collaboration
1. **Following Specific Directions**:
   - Implement exactly what was requested without overreaching
   - When asked to remove something specific (like a line break), don't remove more than specified
   - Be precise with edits and respect the exact intent of the request

2. **Understanding the Vision**:
   - The project values simplicity, fun, and showcasing model capabilities
   - Focus on letting the models contribute naturally with minimal intervention
   - Maintain clarity in the output for users to easily understand what's happening

3. **Iterative Refinement**:
   - Make incremental improvements based on feedback
   - Add optional features rather than changing core functionality
   - Keep environmental configurations flexible using environment variables

4. **Documentation**:
   - Keep README updated with new features and options
   - Provide clear examples of different usage patterns
   - Document configuration options thoroughly

5. **Code Organization**:
   - Keep related functionality together
   - Use clear variable names
   - Maintain consistent coding patterns