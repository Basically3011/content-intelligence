'use client'

import { cn } from "@/lib/utils"

interface StageProgressProps {
  currentStage?: string | null
}

const STAGES = ['Awareness', 'Explore', 'Evaluate', 'Decision'] as const

export function StageProgress({ currentStage }: StageProgressProps) {
  const currentIndex = currentStage
    ? STAGES.findIndex(s => s === currentStage)
    : -1

  return (
    <div className="flex items-center w-full">
      {STAGES.map((stage, index) => {
        const isActive = index === currentIndex
        const isPassed = currentIndex > -1 && index < currentIndex

        return (
          <div
            key={stage}
            className={cn(
              "relative flex-1 h-10 flex items-center justify-center text-sm font-medium transition-colors",
              "first:rounded-l-md last:rounded-r-md",
              // Colors
              isActive && "bg-foreground text-background",
              !isActive && isPassed && "bg-muted text-muted-foreground",
              !isActive && !isPassed && "bg-muted/50 text-muted-foreground/70",
            )}
            style={{
              clipPath: index === STAGES.length - 1
                ? undefined // Last stage - no arrow
                : 'polygon(0 0, calc(100% - 12px) 0, 100% 50%, calc(100% - 12px) 100%, 0 100%, 12px 50%)',
              marginLeft: index === 0 ? 0 : '-12px',
              paddingLeft: index === 0 ? '8px' : '20px',
              paddingRight: index === STAGES.length - 1 ? '8px' : '20px',
              zIndex: STAGES.length - index,
            }}
          >
            {stage}
          </div>
        )
      })}
    </div>
  )
}
