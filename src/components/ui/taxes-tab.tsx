import { H3 } from '@/components/ui/typography';
import * as React from 'react';
import Link from 'next/link';
import { TabsContent } from '@/components/ui/tabs';
import { Card, CardHeader, CardDescription } from '@/components/ui/card';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function TaxesTab() {
    return (
        <TabsContent value="taxes">
            <Card>
                <CardHeader>
                    <H3>Gestión de Impuestos</H3>
                    <CardDescription>
                        Configura los tipos impositivos que se aplicarán en tu negocio.
                        <Link href="/settings/taxes" className={cn(buttonVariants({ variant: "link" }), "p-0 h-auto ml-2")}>
                            Ir a la gestión avanzada de impuestos.
                        </Link>
                    </CardDescription>
                </CardHeader>
            </Card>
        </TabsContent>
    );
}

