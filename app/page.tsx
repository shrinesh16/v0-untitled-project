"use client"

import { useState } from "react"
import { useChat } from "ai/react"
import { ChatMessage } from "@/components/chat-message"
import { ChatInput } from "@/components/chat-input"
import { ThemeToggle } from "@/components/theme-toggle"
import { ModelSelector } from "@/components/model-selector"
import { Trash2, Info, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { models } from "@/lib/ai-models"

export default function Home() {
  const [selectedModel, setSelectedModel] = useState("gpt-4o")
  const [error, setError] = useState<string | null>(null)

  const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages } = useChat({
    body: {
      model: selectedModel,
    },
    onError: (error) => {
      console.error("Chat error:", error)
      setError(`Error: ${error.message || "Failed to communicate with AI service. Please try again."}`)
    },
  })

  const clearChat = () => {
    setMessages([])
    setError(null)
  }

  const handleModelChange = (modelId: string) => {
    setSelectedModel(modelId)
    setError(null)
  }

  const selectedModelInfo = models.find((model) => model.id === selectedModel)

  const handleMessageSubmit = (content: string) => {
    setError(null)
    handleSubmit({ content })
  }

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <header className="sticky top-0 z-10 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="container flex items-center justify-between h-16 px-4 mx-auto">
          <h1 className="text-xl font-bold">CodeOptimizer</h1>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={clearChat}
              disabled={messages.length === 0 && !error}
              aria-label="Clear chat"
              className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            >
              <Trash2 className="h-5 w-5" />
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex flex-col h-full">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ModelSelector selectedModel={selectedModel} onSelectModel={handleModelChange} />
              {selectedModelInfo && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Info className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{selectedModelInfo.description}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-zinc-500 dark:text-zinc-400">{isLoading ? "Processing..." : "Ready"}</span>
              <div className={`h-2 w-2 rounded-full ${isLoading ? "bg-yellow-500 animate-pulse" : "bg-green-500"}`} />
            </div>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex-1 space-y-4 mb-4">
            {messages.length === 0 && !error ? (
              <div className="flex flex-col items-center justify-center h-[50vh] text-center space-y-4">
                <div className="text-4xl font-bold">Welcome to CodeOptimizer</div>
                <p className="text-zinc-600 dark:text-zinc-400 max-w-md">
                  Paste your code or ask questions about code optimization, bug fixing, and best practices.
                </p>
                <div className="text-sm text-zinc-500 dark:text-zinc-400 mt-8">
                  <p>
                    Currently using: <strong>{selectedModelInfo?.name}</strong>
                  </p>
                  <p className="mt-1">{selectedModelInfo?.description}</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4 divide-y divide-zinc-200 dark:divide-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
                {messages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))}
              </div>
            )}
          </div>

          <div className="sticky bottom-0 bg-zinc-50 dark:bg-zinc-950 pt-4">
            <ChatInput onSubmit={handleMessageSubmit} isLoading={isLoading} />
          </div>
        </div>
      </main>
    </div>
  )
}
