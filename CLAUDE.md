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