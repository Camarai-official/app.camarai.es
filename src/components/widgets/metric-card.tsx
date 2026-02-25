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
      "relative",
      className
    )}>
      <CardHeader 
        title={title} 
        icon={Icon} 
      />
      
      <CardContent>
        <div className="flex flex-col gap-1.5">
          {value && (
            <H1>
              {value}
            </H1>
          )}
          
          {change && (
            <div className="flex items-center gap-2 mt-1">
              <Badge 
                variant={isIncrease ? 'success' : 'danger'} 
              >
                {isIncrease ? <TrendingUp /> : <TrendingDown />}
                {change}
              </Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
