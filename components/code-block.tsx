"use client"

import { Check, Copy } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"

interface CodeBlockProps {
  code: string
  language?: string
}

export function CodeBlock({ code, language = "javascript" }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative my-4 rounded-md bg-zinc-950 dark:bg-zinc-900">
      <div className="flex items-center justify-between px-4 py-2 text-xs text-zinc-100 bg-zinc-800">
        <span>{language}</span>
        <Button
          variant="ghost"
          size="icon"
          onClick={copyToClipboard}
          className="h-8 w-8 text-zinc-100 hover:text-white hover:bg-zinc-700"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>
      <pre className="p-4 overflow-x-auto text-sm text-zinc-100">
        <code>{code}</code>
      </pre>
    </div>
  )
}
