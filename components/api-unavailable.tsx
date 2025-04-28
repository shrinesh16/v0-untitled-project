"use client"

import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ApiUnavailable() {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
      <h2 className="text-2xl font-bold mb-2">API Unavailable</h2>
      <p className="text-zinc-600 dark:text-zinc-400 mb-6 max-w-md">
        We're having trouble connecting to the AI service. This could be due to:
      </p>
      <ul className="text-left text-zinc-600 dark:text-zinc-400 mb-6 max-w-md">
        <li className="mb-2">• Missing or invalid API key</li>
        <li className="mb-2">• Network connectivity issues</li>
        <li className="mb-2">• Service outage</li>
      </ul>
      <Button onClick={() => window.location.reload()}>Refresh Page</Button>
    </div>
  )
}
