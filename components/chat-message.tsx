import type { Message } from "ai"
import { CodeBlock } from "./code-block"
import { User, Bot } from "lucide-react"

export function ChatMessage({ message }: { message: Message }) {
  // Function to detect and parse code blocks in the message
  const renderMessageContent = (content: string) => {
    if (!content) return null

    try {
      // Split the content by code blocks (```code```)
      const parts = content.split(/(```[\s\S]*?```)/g)

      return parts.map((part, index) => {
        // Check if this part is a code block
        if (part.startsWith("```") && part.endsWith("```")) {
          // Extract language and code
          const match = part.match(/```(\w+)?\n([\s\S]*?)```/)
          if (match) {
            const language = match[1] || "javascript"
            const code = match[2]
            return <CodeBlock key={index} code={code} language={language} />
          }
        }

        // Regular text
        return (
          <p key={index} className="whitespace-pre-wrap">
            {part}
          </p>
        )
      })
    } catch (error) {
      console.error("Error rendering message content:", error)
      return <p className="text-red-500">Error rendering message content</p>
    }
  }

  return (
    <div
      className={`flex items-start gap-4 p-4 ${
        message.role === "user" ? "bg-zinc-50 dark:bg-zinc-900" : "bg-white dark:bg-zinc-800"
      }`}
    >
      <div className="flex-shrink-0 p-2 rounded-full bg-zinc-200 dark:bg-zinc-700">
        {message.role === "user" ? (
          <User className="h-5 w-5 text-zinc-700 dark:text-zinc-300" />
        ) : (
          <Bot className="h-5 w-5 text-zinc-700 dark:text-zinc-300" />
        )}
      </div>
      <div className="flex-1 space-y-2">
        <div className="font-medium">{message.role === "user" ? "You" : "CodeOptimizer"}</div>
        <div className="prose dark:prose-invert max-w-none">
          {typeof message.content === "string" ? renderMessageContent(message.content) : "Unsupported message format"}
        </div>
      </div>
    </div>
  )
}
