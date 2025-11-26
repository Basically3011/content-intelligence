'use client'

import { CheckCircle2, XCircle, MinusCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface ContentFlagTileProps {
  label: string
  value: boolean | null
  isPositive?: boolean // Whether TRUE is a good thing
}

export function ContentFlagTile({ label, value, isPositive = true }: ContentFlagTileProps) {
  // Determine icon and color based on value and whether it's positive
  const getIcon = () => {
    if (value === null) {
      return <MinusCircle className="h-5 w-5" />
    }

    // If TRUE
    if (value) {
      return isPositive
        ? <CheckCircle2 className="h-5 w-5" />
        : <XCircle className="h-5 w-5" />
    }

    // If FALSE
    return isPositive
      ? <XCircle className="h-5 w-5" />
      : <CheckCircle2 className="h-5 w-5" />
  }

  const getColorClass = () => {
    if (value === null) {
      return "text-muted-foreground bg-muted/30"
    }

    // If TRUE
    if (value) {
      return isPositive
        ? "text-green-600 bg-green-50 dark:bg-green-950/30"
        : "text-red-600 bg-red-50 dark:bg-red-950/30"
    }

    // If FALSE
    return isPositive
      ? "text-red-600 bg-red-50 dark:bg-red-950/30"
      : "text-green-600 bg-green-50 dark:bg-green-950/30"
  }

  return (
    <div className={cn(
      "flex items-center gap-2 px-3 py-2 rounded-md border transition-colors",
      getColorClass()
    )}>
      {getIcon()}
      <span className="text-sm font-medium">
        {label}
      </span>
    </div>
  )
}
