import { cn } from "@/lib/utils"

interface PageContentProps extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode
}

export function PageContent({ children, className, ...props }: PageContentProps) {
  return (
    <main 
      className={cn("flex flex-1 flex-col gap-6 p-4 pt-2 md:p-6 md:pt-3", className)} 
      {...props}
    >
      {children}
    </main>
  )
}
