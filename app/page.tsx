"use client"

import { useState, useEffect } from "react"
import { useChat } from "ai/react"
import { ChatMessage } from "@/components/chat-message"
import { ChatInput } from "@/components/chat-input"
import { ThemeToggle } from "@/components/theme-toggle"
import { EnvChecker } from "@/components/env-checker"
import { Trash2, AlertCircle, RefreshCw, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function Home() {
  const [error, setError] = useState<string | null>(null)
  const [apiStatus, setApiStatus] = useState<{
    openai: boolean
    deepseek: boolean
    fallbackActive: boolean
  }>({
    openai: false,
    deepseek: false,
    fallbackActive: false,
  })
  const [selectedModel, setSelectedModel] = useState<string>("openai")

  useEffect(() => {
    // Check API status
    const checkApiStatus = async () => {
      try {
        const response = await fetch("/api/health")
        if (response.ok) {
          const data = await response.json()

          const openaiConfigured = data.services?.openai === "configured"
          const deepseekConfigured = data.services?.deepseek === "configured"

          setApiStatus({
            openai: openaiConfigured,
            deepseek: deepseekConfigured,
            fallbackActive: !openaiConfigured && !deepseekConfigured,
          })

          // Set default model based on availability
          if (openaiConfigured) {
            setSelectedModel("openai")
          } else if (deepseekConfigured) {
            setSelectedModel("deepseek")
          }

          // Log API status for debugging
          console.log("API Status:", data)
        }
      } catch (error) {
        console.error("Error checking API status:", error)
        setApiStatus({
          openai: false,
          deepseek: false,
          fallbackActive: true,
        })
      }
    }

    checkApiStatus()
  }, [])

  const { messages, isLoading, append, reload, setMessages } = useChat({
    api: "/api/chat",
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
    if (apiStatus.fallbackActive) {
      return "Fallback Mode"
    }

    switch (selectedModel) {
      case "openai":
        return "OpenAI GPT-4o"
      case "deepseek":
        return "DeepSeek Coder"
      default:
        return "Unknown Model"
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
        <EnvChecker />

        {apiStatus.fallbackActive && (
          <Alert className="mb-4 bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800">
            <Info className="h-4 w-4 text-yellow-800 dark:text-yellow-200" />
            <AlertTitle className="text-yellow-800 dark:text-yellow-200">Fallback Mode Active</AlertTitle>
            <AlertDescription className="text-yellow-800 dark:text-yellow-200">
              Both OpenAI and DeepSeek API keys appear to be invalid or missing. The system is running in fallback mode
              with limited functionality.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col h-full">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Select value={selectedModel} onValueChange={setSelectedModel} disabled={apiStatus.fallbackActive}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select Model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="openai" disabled={!apiStatus.openai}>
                    OpenAI GPT-4o
                  </SelectItem>
                  <SelectItem value="deepseek" disabled={!apiStatus.deepseek}>
                    DeepSeek Coder
                  </SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-zinc-500 dark:text-zinc-400">
                Using {getModelName()} for code optimization
                {apiStatus.fallbackActive && (
                  <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 px-2 py-0.5 rounded-full">
                    Limited functionality
                  </span>
                )}
              </span>
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
                {apiStatus.fallbackActive && (
                  <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg max-w-md">
                    <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                      <strong>Note:</strong> Fallback mode is active due to API key issues. Responses are simulated and
                      may not provide actual code optimization. Please check your API keys.
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
