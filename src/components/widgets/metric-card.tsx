
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
    <Card className={cn("border-none shadow-none rounded-lg p-4", className)}>
      <CardHeader className="p-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {value && (
          <p className="text-2xl font-bold text-primary">
            {value}
          </p>
        )}
        {change && (
          <Badge variant={isIncrease ? 'success' : 'danger'}>
            {change}
          </Badge>
        )}

      </CardContent>
    </Card>
  );
}
