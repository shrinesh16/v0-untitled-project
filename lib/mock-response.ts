export function generateMockResponse(prompt: string): string {
  // Extract code blocks from the prompt if present
  const codeBlockRegex = /```([a-zA-Z]*)\n([\s\S]*?)```/g
  const codeBlocks = [...prompt.matchAll(codeBlockRegex)]

  if (codeBlocks.length > 0) {
    // If code blocks are found, generate a mock code optimization response
    const language = codeBlocks[0][1] || "javascript"
    const code = codeBlocks[0][2]

    return `I've analyzed your ${language} code and found some potential optimizations:

## Analysis

The code appears to be ${code.length < 100 ? "quite short and simple" : "moderately complex"}. Here are some observations:

1. **Structure**: The overall structure is ${Math.random() > 0.5 ? "good" : "could be improved for readability"}.
2. **Performance**: There are some ${Math.random() > 0.5 ? "minor" : "potential"} performance optimizations possible.
3. **Best Practices**: Some code style improvements could be made to follow modern standards.

## Suggested Improvements

Here's an optimized version of your code:

\`\`\`${language}
${code.trim()}

// Additional comments and optimizations would be suggested here
// In a real API response, specific improvements would be made
\`\`\`

**Note**: This is a demo response as both OpenAI and DeepSeek APIs are currently unavailable. Please try again later when the services are restored.`
  } else {
    // If no code blocks, generate a general response
    return `Thank you for your question about code optimization.

To provide specific optimization advice, I would need to see the code you're working with. Could you please share the code snippet you'd like me to analyze?

You can format your code using markdown code blocks like this:

\`\`\`javascript
// Your code here
function example() {
  console.log("Hello world");
}
\`\`\`

**Note**: This is a demo response as both OpenAI and DeepSeek APIs are currently unavailable. Please try again later when the services are restored.`
  }
}
