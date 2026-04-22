'use client';
import * as React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { DashboardList, DashboardListItem } from '@/components/ui/dashboard-list';
import { Trophy } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useEstablishments } from '@/hooks/useEstablishments';

export function TeamLeaderboard({ date }: { date?: DateRange }) {
    const { activeEstablishment } = useEstablishments();
    
    const from = date?.from || new Date();
    const to = date?.to || from;

    const rankingData = useQuery(
        api.analytics.getStaffSalesRanking,
        activeEstablishment?.id && from && to
            ? {
                establishmentId: activeEstablishment.id as any,
                startDate: from.getTime(),
                endDate: to.getTime(),
            }
            : 'skip'
    );

    const leaderboardData = React.useMemo(() => {
        if (!rankingData || rankingData.length === 0) {
            return [];
        }
        return rankingData.slice(0, 5);
    }, [rankingData]);

    return (
        <Card className="h-full">
            <CardHeader 
                title="Ranking Equipo" 
                icon={Trophy} 
            />
            <CardContent className="pt-0">
                {leaderboardData.length === 0 ? (
                    <div className="py-10 text-center text-sm text-muted-foreground">
                        No hay datos de ventas disponibles
                    </div>
                ) : (
                    <DashboardList>
                        {leaderboardData.map(member => (
                            <DashboardListItem
                                key={member.id}
                                title={member.name}
                                icon={
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={member.avatar} alt={member.name} />
                                        <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                }
                                value={`€${member.sales.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                            />
                        ))}
                    </DashboardList>
                )}
            </CardContent>
        </Card>
    );
}
