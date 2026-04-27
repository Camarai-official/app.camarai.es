import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

const Tabs = TabsPrimitive.Root

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> & { 
    marginBottom?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  }
>(({ className, marginBottom = 'none', children, ...props }, ref) => {
  const [showLeft, setShowLeft] = React.useState(false);
  const [showRight, setShowRight] = React.useState(false);
  const listRef = React.useRef<HTMLDivElement>(null);

  // Expose both refs
  React.useImperativeHandle(ref, () => listRef.current as any);

  const checkScroll = React.useCallback(() => {
    if (listRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = listRef.current;
      setShowLeft(scrollLeft > 10);
      setShowRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (listRef.current) {
      const scrollAmount = 200;
      listRef.current.scrollBy({ 
        left: direction === 'left' ? -scrollAmount : scrollAmount, 
        behavior: 'smooth' 
      });
    }
  };

  React.useEffect(() => {
    const el = listRef.current;
    if (el) {
      checkScroll();
      el.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);

      // Use ResizeObserver to detect content size changes instead of depending on children
      let observer: ResizeObserver | undefined;
      if (typeof ResizeObserver !== 'undefined') {
        observer = new ResizeObserver(checkScroll);
        observer.observe(el);
      }

      const timeout = setTimeout(checkScroll, 100);
      return () => {
        el.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
        observer?.disconnect();
        clearTimeout(timeout);
      };
    }
  }, [checkScroll]);

  return (
    <div 
      className={cn(
        "w-full",
        marginBottom === 'sm' && "mb-2",
        marginBottom === 'md' && "mb-4",
        marginBottom === 'lg' && "mb-6",
        marginBottom === 'xl' && "mb-8",
        className
      )}
    >
      <div className="relative w-full group/tabslist flex items-center h-[52px] sm:h-auto overflow-hidden">
        {/* Left Indicator/Button */}
        <div 
          className={cn(
            "absolute left-0 inset-y-0 z-20 w-12 flex items-center justify-start pl-1 transition-all duration-300 sm:hidden",
            "bg-gradient-to-r from-background via-background/90 to-transparent",
            showLeft ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2 pointer-events-none"
          )}
        >
          <button 
            type="button"
            onClick={() => scroll('left')}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-background shadow-md border border-border/50 text-muted-foreground active:scale-95"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
        </div>

        <TabsPrimitive.List
          ref={listRef}
          className={cn(
            "inline-flex h-full sm:h-auto items-center justify-start sm:justify-start text-muted-foreground overflow-x-auto no-scrollbar flex-nowrap w-full transition-all",
            "bg-muted/30 p-1.5 gap-1.5 rounded-2xl border border-border/50",
            "sm:bg-transparent sm:p-0 sm:gap-1 sm:rounded-none sm:border-none"
          )}
          {...props}
        >
          {children}
        </TabsPrimitive.List>

        {/* Right Indicator/Button */}
        <div 
          className={cn(
            "absolute right-0 inset-y-0 z-20 w-12 flex items-center justify-end pr-1 transition-all duration-300 sm:hidden",
            "bg-gradient-to-l from-background via-background/90 to-transparent",
            showRight ? "opacity-100 translate-x-0" : "opacity-0 translate-x-2 pointer-events-none"
          )}
        >
          <button 
            type="button"
            onClick={() => scroll('right')}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-background shadow-md border border-border/50 text-muted-foreground active:scale-95"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>
  );
})
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> & {
    icon?: React.ElementType
    iconClassName?: string
  }
>(({ className, icon: Icon, iconClassName, children, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "group inline-flex items-center justify-center whitespace-nowrap rounded-xl px-3 sm:px-4 py-2 h-10 min-w-10 text-[12px] sm:text-sm font-semibold transition-all duration-300 shrink-0 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground data-[state=active]:shadow-none",
      className
    )}
    {...props}
  >
    {Icon && (
      <Icon 
        className={cn(
          "h-4 w-4 shrink-0 transition-all duration-300",
          children ? "mr-2" : "",
          "text-muted-foreground group-data-[state=active]:text-secondary-foreground",
          iconClassName
        )} 
      />
    )}
    {children && (
      <span className="transition-all duration-300 opacity-100">
        {children}
      </span>
    )}
  </TabsPrimitive.Trigger>
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content> & { spaced?: boolean }
>(({ className, spaced = false, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "focus-visible:outline-none",
      spaced && "space-y-6",
      className
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
