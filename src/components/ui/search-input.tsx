import * as React from "react"
import { Search } from "lucide-react"

import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export interface SearchInputProps extends React.ComponentProps<typeof Input> {
  containerClassName?: string
  width?: 'full' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '300'
}

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, containerClassName, width = 'full', ...props }, ref) => {
    return (
      <div className={cn(
        "relative", 
        width === 'full' && "w-full",
        width === 'xs' && "w-[100px]",
        width === 'sm' && "w-[120px]",
        width === 'md' && "w-[180px]",
        width === 'lg' && "w-[200px]",
        width === 'xl' && "w-[240px]",
        width === '300' && "w-full sm:w-[300px]",
        containerClassName
      )}>
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={ref}
          className={cn("pl-8 placeholder:truncate", className)}
          {...props}
        />
      </div>
    )
  }
)
SearchInput.displayName = "SearchInput"

export { SearchInput }
