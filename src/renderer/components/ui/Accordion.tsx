import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "../../lib/utils"

interface AccordionProps {
  title: string
  children: React.ReactNode
  isOpen?: boolean
  onToggle?: () => void
  className?: string
}

export const Accordion: React.FC<AccordionProps> = ({
  title,
  children,
  isOpen = false,
  onToggle,
  className
}) => {
  const [internalOpen, setInternalOpen] = React.useState(isOpen)
  
  const handleToggle = () => {
    if (onToggle) {
      onToggle()
    } else {
      setInternalOpen(!internalOpen)
    }
  }
  
  const open = onToggle ? isOpen : internalOpen

  return (
    <div className={cn("border border-zinc-700/50 rounded-lg overflow-hidden", className)}>
      <button
        onClick={handleToggle}
        className="w-full flex items-center justify-between p-3 bg-zinc-800/50 hover:bg-zinc-800/70 transition-colors duration-150"
      >
        <span className="text-sm font-medium text-zinc-200">{title}</span>
        <ChevronDown 
          className={cn(
            "h-4 w-4 text-zinc-400 transition-transform duration-200",
            open && "rotate-180"
          )} 
        />
      </button>
      
      {open && (
        <div className="p-3 bg-zinc-900/30 border-t border-zinc-700/30 animate-in slide-in-from-top duration-200">
          {children}
        </div>
      )}
    </div>
  )
}