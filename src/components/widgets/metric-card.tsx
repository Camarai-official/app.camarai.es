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
  badge?: string;
  icon?: LucideIcon;
  className?: string;
};

export function MetricCard({ title, value, change, changeType, badge, icon: Icon, className }: MetricCardProps) {
  const isIncrease = changeType === 'increase';

  return (
    <Card position="relative">
      <CardHeader 
        title={title} 
        icon={Icon} 
      />
      
      <CardContent>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            {value && (
              <H1>
                {value}
              </H1>
            )}
            {badge && (
              <Badge variant="completed" size="xs">
                {badge}
              </Badge>
            )}
          </div>
          
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
