export type ModelProvider = "openai" | "deepseek"

export interface ModelOption {
  id: string
  name: string
  provider: ModelProvider
  description: string
}

export const models: ModelOption[] = [
  {
    id: "gpt-4o",
    name: "GPT-4o",
    provider: "openai",
    description: "OpenAI's most advanced model for code optimization",
  },
  {
    id: "deepseek-coder",
    name: "DeepSeek Coder",
    provider: "deepseek",
    description: "Specialized in code understanding and generation",
  },
]

export const getSystemPrompt = (modelId: string) => {
  const basePrompt = `You are CodeOptimizer, an AI assistant specialized in optimizing and fixing code.
  - Analyze code for inefficiencies, bugs, and potential improvements
  - Suggest better algorithms, data structures, and patterns
  - Explain your reasoning clearly and concisely
  - Provide optimized code examples when appropriate
  - Focus on best practices and modern coding standards
  - Be specific about performance improvements`

  // You can customize prompts per model if needed
  if (modelId === "deepseek-coder") {
    return `${basePrompt}
    - Leverage your deep understanding of code patterns
    - Focus on practical, production-ready solutions`
  }

  return basePrompt
}
