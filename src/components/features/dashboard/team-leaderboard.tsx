
'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import type { StaffMember } from '@/data/mock-data';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Users } from 'lucide-react';


import { DateRange } from 'react-day-picker';

type TeamLeaderboardProps = {
    staff: StaffMember[];
    date?: DateRange;
};

type LeaderboardEntry = {
    id: string;
    name: string;
    avatar: string;
    sales: number;
    percentage: number;
};

export function TeamLeaderboard({ staff, date }: TeamLeaderboardProps) {
    const leaderboardData = React.useMemo(() => {
        const dateFactor = date?.from ? date.from.getTime() : 1;
        // Simulate sales data and calculate percentages
        const dataWithSales = staff
            .filter(s => s.estado === 'Activo')
            .map((s, index) => {
                const seed = (index + (dateFactor % 10)) * 1234;
                return {
                    ...s,
                    sales: 20000 - (index * 1500) + (seed % 2000),
                };
            });

        const maxSales = Math.max(...dataWithSales.map(s => s.sales), 0);

        return dataWithSales.map(s => ({
            id: s.id,
            name: s.nombre,
            avatar: s.fotoUrl,
            sales: s.sales,
            percentage: maxSales > 0 ? (s.sales / maxSales) * 100 : 0
        })).sort((a, b) => b.sales - a.sales);
    }, [staff]);

    return (
        <Card className="bg-card h-full flex flex-col">
            <CardHeader>
                <CardTitle className="text-base font-bold text-muted-foreground">Ranking Equipo</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow p-4 pt-0">
                <ScrollArea className="h-[240px] pr-3">
                    <div className="space-y-6">
                        {leaderboardData.map(member => (
                            <div key={member.id} className="flex items-center gap-4">
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={member.avatar} alt={member.name} data-ai-hint="profile person" />
                                    <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-grow space-y-1">
                                    <div className="flex justify-between items-baseline">
                                        <p className="text-sm font-semibold truncate">{member.name}</p>
                                        <p className="text-xs font-mono text-muted-foreground">{member.percentage.toFixed(0)}%</p>
                                    </div>
                                    <p className="text-xs text-muted-foreground -mt-1">€{member.sales.toLocaleString('es-ES')}</p>
                                    <Progress value={member.percentage} className="h-1.5" indicatorClassName="bg-primary" />
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
