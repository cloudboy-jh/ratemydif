"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Copy, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface CopyButtonProps {
  text: string
  className?: string
  size?: "sm" | "default" | "lg"
  variant?: "default" | "outline" | "ghost"
}

export function CopyButton({ text, className, size = "sm", variant = "outline" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy text:', err)
    }
  }

  return (
    <Button
      onClick={handleCopy}
      variant={variant}
      size={size}
      className={cn("min-w-[80px] min-h-[40px] sm:min-h-[36px] text-xs sm:text-sm", className)}
    >
      {copied ? (
        <>
          <Check className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
          <span className="hidden xs:inline">Copied</span>
          <span className="xs:hidden">✓</span>
        </>
      ) : (
        <>
          <Copy className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
          <span className="hidden xs:inline">Copy</span>
          <span className="xs:hidden">📋</span>
        </>
      )}
    </Button>
  )
}