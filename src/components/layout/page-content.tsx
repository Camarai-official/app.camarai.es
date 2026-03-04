import { cn } from "@/lib/utils"

interface PageContentProps extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode;
  gap?: 'none' | 'sm' | 'md' | 'lg';
}

export function PageContent({ children, className, gap = 'lg', ...props }: PageContentProps) {
  return (
    <main 
      className={cn(
        "flex flex-1 flex-col p-4 pt-2 md:p-6 md:pt-3", 
        gap === 'none' && "gap-0",
        gap === 'sm' && "gap-2",
        gap === 'md' && "gap-4",
        gap === 'lg' && "gap-6",
        className
      )} 
      {...props}
    >
      {children}
    </main>
  )
}
