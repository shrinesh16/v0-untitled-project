"use client"

import type React from "react"

import { useState } from "react"
import { Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

interface ChatInputProps {
  onSubmit: (message: string) => void
  isLoading: boolean
}

export function ChatInput({ onSubmit, isLoading }: ChatInputProps) {
  const [inputValue, setInputValue] = useState("")

  const handleSubmitMessage = () => {
    if (inputValue.trim() && !isLoading) {
      onSubmit(inputValue)
      setInputValue("")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmitMessage()
    }
  }

  return (
    <div className="flex items-end gap-2">
      <Textarea
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Paste your code or ask a question..."
        className="min-h-[80px] resize-none border border-zinc-300 dark:border-zinc-700 focus-visible:ring-zinc-500"
        disabled={isLoading}
      />
      <Button
        type="button"
        onClick={handleSubmitMessage}
        disabled={isLoading || !inputValue.trim()}
        className="bg-zinc-900 hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
      >
        {isLoading ? (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900 dark:border-zinc-700 dark:border-t-zinc-100" />
        ) : (
          <Send className="h-4 w-4" />
        )}
        <span className="sr-only">Send</span>
      </Button>
    </div>
  )
}
