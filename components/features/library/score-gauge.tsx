'use client'

import { cn } from "@/lib/utils"

interface ScoreGaugeProps {
  label: string
  score: number | null // 1-5 scale
  size?: 'sm' | 'md' | 'lg'
}

export function ScoreGauge({ label, score, size = 'md' }: ScoreGaugeProps) {
  // Size configurations
  const sizeConfig = {
    sm: { circle: 60, stroke: 6, text: 'text-lg', label: 'text-xs' },
    md: { circle: 80, stroke: 8, text: 'text-2xl', label: 'text-sm' },
    lg: { circle: 100, stroke: 10, text: 'text-3xl', label: 'text-base' },
  }

  const config = sizeConfig[size]
  const radius = (config.circle - config.stroke) / 2
  const circumference = radius * Math.PI * 2

  // Calculate percentage (1-5 scale to 0-100%)
  const percentage = score ? ((score - 1) / 4) * 100 : 0
  const offset = circumference - (percentage / 100) * circumference

  // Color based on score
  const getScoreColor = (score: number | null) => {
    if (!score) return 'text-muted-foreground'
    if (score >= 4.5) return 'text-green-600'
    if (score >= 3.5) return 'text-blue-600'
    if (score >= 2.5) return 'text-yellow-600'
    if (score >= 1.5) return 'text-orange-600'
    return 'text-red-600'
  }

  const getStrokeColor = (score: number | null) => {
    if (!score) return 'stroke-muted-foreground/30'
    if (score >= 4.5) return 'stroke-green-600'
    if (score >= 3.5) return 'stroke-blue-600'
    if (score >= 2.5) return 'stroke-yellow-600'
    if (score >= 1.5) return 'stroke-orange-600'
    return 'stroke-red-600'
  }

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Circular Gauge */}
      <div className="relative" style={{ width: config.circle, height: config.circle }}>
        <svg
          className="transform -rotate-90"
          width={config.circle}
          height={config.circle}
        >
          {/* Background circle */}
          <circle
            cx={config.circle / 2}
            cy={config.circle / 2}
            r={radius}
            className="stroke-muted/30"
            strokeWidth={config.stroke}
            fill="none"
          />
          {/* Progress circle */}
          <circle
            cx={config.circle / 2}
            cy={config.circle / 2}
            r={radius}
            className={cn("transition-all duration-500", getStrokeColor(score))}
            strokeWidth={config.stroke}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>

        {/* Score text in center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn("font-bold", config.text, getScoreColor(score))}>
            {score ? score.toFixed(1) : '—'}
          </span>
        </div>
      </div>

      {/* Label */}
      <div className={cn("font-medium text-center", config.label)}>
        {label}
      </div>
    </div>
  )
}
