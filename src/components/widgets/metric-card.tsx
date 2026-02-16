import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { H1, H5 } from "@/components/ui/typography";

type MetricCardProps = {
  title: string;
  value?: string;
  change?: string;
  changeType?: 'increase' | 'decrease';
  icon?: LucideIcon;
  className?: string;
};

export function MetricCard({ title, value, change, changeType, icon: Icon, className }: MetricCardProps) {
  const isIncrease = changeType === 'increase';

  return (
    <Card className={cn(
      "relative overflow-hidden",
      className
    )}>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <H5 className="text-muted-foreground">
          {title}
        </H5>
        {Icon && (
          <div className="p-2.5 rounded-xl bg-muted/50 text-muted-foreground shadow-sm border border-border/50">
            <Icon className="h-4 w-4" />
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        <div className="flex flex-col gap-1.5">
          {value && (
            <H1 className="font-extrabold tracking-tight text-3xl">
              {value}
            </H1>
          )}
          
          {change && (
            <div className="flex items-center gap-2 mt-1">
              <Badge 
                variant={isIncrease ? 'success' : 'danger'} 
              >
                {isIncrease ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {change}
              </Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
