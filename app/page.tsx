"use client"

import { useState, useEffect } from "react"
import { useChat } from "ai/react"
import { ChatMessage } from "@/components/chat-message"
import { ChatInput } from "@/components/chat-input"
import { ThemeToggle } from "@/components/theme-toggle"
import { Trash2, AlertCircle, RefreshCw, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function Home() {
  const [error, setError] = useState<string | null>(null)
  const [activeService, setActiveService] = useState<string>("loading")

  useEffect(() => {
    // Check which service is active
    const checkActiveService = async () => {
      try {
        const response = await fetch("/api/health")
        if (response.ok) {
          const data = await response.json()
          setActiveService(data.activeService || "none")
        } else {
          setActiveService("none")
        }
      } catch (error) {
        console.error("Error checking active service:", error)
        setActiveService("none")
      }
    }

    checkActiveService()
  }, [])

  const { messages, isLoading, append, reload, setMessages } = useChat({
    api: "/api/chat",
    onError: (error) => {
      console.error("Chat error:", error)
      setError(`Error: ${error.message || "Failed to communicate with AI service. Please try again."}`)
    },
  })

  const clearChat = () => {
    setMessages([])
    setError(null)
  }

  const handleSendMessage = (message: string) => {
    setError(null)
    append({
      content: message,
      role: "user",
    })
  }

  const retryLastMessage = () => {
    setError(null)
    reload()
  }

  const getModelName = () => {
    switch (activeService) {
      case "openai":
        return "OpenAI GPT-4o"
      case "deepseek":
        return "DeepSeek Coder"
      case "demo":
        return "Demo Mode"
      case "none":
        return "No AI service available"
      default:
        return "Loading..."
    }
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
        {activeService === "demo" && (
          <Alert className="mb-4 bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800">
            <Info className="h-4 w-4 text-blue-800 dark:text-blue-200" />
            <AlertDescription className="text-blue-800 dark:text-blue-200">
              <strong>Demo Mode Active:</strong> Both OpenAI (quota exceeded) and DeepSeek (insufficient balance) are
              unavailable. Using simulated responses for demonstration purposes.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col h-full">
          <div className="mb-6 flex items-center justify-between">
            <div className="text-sm text-zinc-500 dark:text-zinc-400">
              Using {getModelName()} for code optimization
              {activeService === "demo" && (
                <span className="ml-2 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-0.5 rounded-full">
                  Limited functionality
                </span>
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
              <AlertDescription className="flex items-center justify-between">
                <span>{error}</span>
                <Button variant="outline" size="sm" onClick={retryLastMessage} className="ml-2">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              </AlertDescription>
            </Alert>
          )}

          <div className="flex-1 space-y-4 mb-4">
            {messages.length === 0 && !error ? (
              <div className="flex flex-col items-center justify-center h-[50vh] text-center space-y-4">
                <div className="text-4xl font-bold">Welcome to CodeOptimizer</div>
                <p className="text-zinc-600 dark:text-zinc-400 max-w-md">
                  Paste your code or ask questions about code optimization, bug fixing, and best practices.
                </p>
                {activeService === "demo" && (
                  <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg max-w-md">
                    <p className="text-blue-800 dark:text-blue-200 text-sm">
                      <strong>Note:</strong> Demo mode is active due to API limitations. Responses are simulated and may
                      not provide actual code optimization.
                    </p>
                  </div>
                )}
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
            <ChatInput onSubmit={handleSendMessage} isLoading={isLoading} />
          </div>
        </div>
      </main>
    </div>
  )
}
