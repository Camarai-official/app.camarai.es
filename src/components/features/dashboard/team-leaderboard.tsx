'use client';
import * as React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { DashboardList, DashboardListItem } from '@/components/ui/dashboard-list';
import type { StaffMember } from '@/data/mock-data';
import { Trophy } from 'lucide-react';
import { DateRange } from 'react-day-picker';

type TeamLeaderboardProps = {
    staff: StaffMember[];
    date?: DateRange;
};

export function TeamLeaderboard({ staff, date }: TeamLeaderboardProps) {
    const leaderboardData = React.useMemo(() => {
        const dateFactor = date?.from ? date.from.getTime() : 1;
        const dataWithSales = staff
            .filter(s => s.estado === 'Activo')
            .map((s, index) => {
                const seed = (index + (dateFactor % 10)) * 1234;
                return { ...s, sales: 20000 - (index * 1500) + (seed % 2000) };
            });

        return dataWithSales
            .map(s => ({
                id: s.id,
                name: s.nombre,
                avatar: s.fotoUrl,
                sales: s.sales,
            }))
            .sort((a, b) => b.sales - a.sales)
            .slice(0, 5);
    }, [staff, date]);

    return (
        <Card className="h-full">
            <CardHeader 
                title="Ranking Equipo" 
                icon={Trophy} 
            />
            <CardContent className="pt-0">
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
                            value={`€${member.sales.toLocaleString('es-ES')}`}
                        />
                    ))}
                </DashboardList>
            </CardContent>
        </Card>
    );
}
