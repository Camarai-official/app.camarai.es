import { mockMenuCombos, mockCartas } from '@/data/mock-data';

export function generateStaticParams() {
    const ids = new Set([
        ...mockMenuCombos.map(m => m.id),
        ...mockCartas.map(c => c.id)
    ]);
    return Array.from(ids).map(id => ({ id }));
}

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
