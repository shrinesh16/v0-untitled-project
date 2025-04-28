# CodeOptimizer - AI Code Optimization Chatbot

A specialized AI chatbot for code optimization and bug fixing, with support for multiple AI models.

## Features

- Code optimization and bug fixing suggestions
- Support for multiple AI models (OpenAI and DeepSeek)
- Black and white theme with dark/light mode toggle
- Code highlighting and formatting
- Responsive design

## Getting Started

### Prerequisites

- Node.js 18.x or later
- OpenAI API key
- DeepSeek API key

### Environment Variables

Create a `.env.local` file in the root directory with the following variables:

\`\`\`
OPENAI_API_KEY=your_openai_api_key
DEEPSEEK_API_KEY=your_deepseek_api_key
\`\`\`

### Installation

1. Clone the repository
2. Install dependencies:

\`\`\`bash
npm install
# or
yarn install
# or
pnpm install
\`\`\`

3. Run the development server:

\`\`\`bash
npm run dev
# or
yarn dev
# or
pnpm dev
\`\`\`

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deployment on Vercel

This project is optimized for deployment on Vercel.

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Import the project in Vercel
3. Add your environment variables (OPENAI_API_KEY and DEEPSEEK_API_KEY)
4. Deploy

## Usage

1. Select your preferred AI model from the dropdown
2. Type or paste your code in the chat input
3. Ask specific questions about optimization or bug fixing
4. The AI will analyze your code and provide suggestions
5. Use the copy button to copy optimized code snippets

## License

MIT
