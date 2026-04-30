import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
    <Card position="relative" className={cn("overflow-hidden min-h-0", className)}>
      
      {/* 📱 Mobile Layout (Compacto Horizontal) */}
      <div className="flex items-stretch sm:hidden">
        {Icon && (
          <div className="flex items-center justify-center p-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Icon className="h-5 w-5" />
            </div>
          </div>
        )}

        <div className="flex-1 flex flex-col p-3 gap-1 pl-0">
          <div className="flex items-center">
            <h3 className="text-xs font-bold leading-none tracking-tight text-muted-foreground">{title}</h3>
          </div>

          <div className="flex items-baseline gap-2">
            {value && (
              <span className="text-xl font-bold">
                {value}
              </span>
            )}
            
            {change && (
              <Badge 
                variant={isIncrease ? 'success' : 'danger'} 
                className="py-0 h-4 text-[9px]"
              >
                {isIncrease ? <TrendingUp className="h-2 w-2" /> : <TrendingDown className="h-2 w-2" />}
                {change}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* 🖥️ Desktop Layout */}
      <div className="hidden sm:flex flex-col justify-between gap-4 p-6">
        {/* Fila 1: Icono + Título ← → Valor */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {Icon && (
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </div>
            )}
            <h4 className="text-lg font-bold leading-none tracking-tight">{title}</h4>
          </div>
          <div className="flex items-center gap-2">
            {badge && (
              <Badge variant="completed" size="xs">{badge}</Badge>
            )}

          </div>
        </div>

        {/* Fila 2: Badge de cambio */}
        {change && (
          <div className="flex items-center gap-2">
            <Badge variant={isIncrease ? 'success' : 'danger'}>
              {isIncrease ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {change}
            </Badge>
            <span className="text-2xl font-bold">{value}</span>
          </div>
        )}
      </div>

    </Card>
  );
}
