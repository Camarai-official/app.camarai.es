
import { format } from "date-fns";

export const generateCSV = (data: any[], filename: string) => {
    if (!data.length) return;

    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(fieldName => {
            const val = row[fieldName];
            return typeof val === 'string' ? `"${val}"` : val;
        }).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${filename}-${format(new Date(), 'yyyy-MM-dd')}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};

export const prepareDashboardExportData = (
    metrics: any,
    orders: any[],
    products: any[]
) => {
    // Combine data into a flat structure or multiple sheets if we were using xlsx.
    // For CSV, we'll export the most critical data: Orders or a Summary.
    // Let's create a Summary row + Order details below?
    // Actually, usually "Export Global Excel" implies all data. 
    // Since we are mocking, let's export the Orders list as the primary "Detail" export, 
    // and maybe we can console log that we would ideally use a multi-sheet Excel library (xlsx) for full export.

    // For this prototype, let's export the Orders List as it's the most tabular data.
    return orders.map(o => ({
        OrderID: o.order,
        Time: o.time,
        Table: o.table,
        Customer: o.name,
        Total: o.total,
        Status: o.status,
        Items: Array.isArray(o.items)
            ? o.items.map((i: any) => typeof i === 'string' ? i : `${i.quantity}x ${i.name}`).join('; ')
            : ''
    }));
};
