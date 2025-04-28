"use client"

import { useEffect, useState } from "react"
import { AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ErrorFallbackProps {
  error: Error
  resetErrorBoundary: () => void
}

export function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      resetErrorBoundary()
    }
  }, [countdown, resetErrorBoundary])

  return (
    <div className="flex flex-col items-center justify-center h-screen p-4 bg-zinc-50 dark:bg-zinc-950">
      <div className="max-w-md p-6 bg-white dark:bg-zinc-900 rounded-lg shadow-lg">
        <div className="flex items-center gap-2 text-red-500 mb-4">
          <AlertCircle className="h-6 w-6" />
          <h2 className="text-xl font-bold">Something went wrong</h2>
        </div>

        <p className="text-zinc-700 dark:text-zinc-300 mb-4">
          {error.message || "An unexpected error occurred. Please try again."}
        </p>

        <div className="flex justify-between items-center">
          <Button variant="outline" onClick={resetErrorBoundary} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Retry Now
          </Button>

          <p className="text-sm text-zinc-500">Auto-retrying in {countdown} seconds...</p>
        </div>
      </div>
    </div>
  )
}
