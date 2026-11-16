export const currency = new Intl.NumberFormat('es-EC');
export const productPrice = new Intl.NumberFormat('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const unitAmount = new Intl.NumberFormat('es-EC', { maximumFractionDigits: 3 });
export function formatUnitAmount(amount: number, unit: string): string {
    return `${unitAmount.format(amount)} ${unit}`;
}
export const dateTime = new Intl.DateTimeFormat('es-EC', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
});
