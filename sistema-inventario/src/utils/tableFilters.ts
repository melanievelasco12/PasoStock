export function matchesColumnFilter(value: string | number, filter: string): boolean {
    const normalize = (text: string) => text
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLocaleLowerCase('es');
    return normalize(String(value)).includes(normalize(filter.trim()));
}
