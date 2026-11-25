export const productUnits = [
    { value: 'unidad', label: 'Unidad (u)' },
    { value: 'kg', label: 'Kilogramo (kg)' },
    { value: 'g', label: 'Gramo (g)' },
    { value: 'lb', label: 'Libra (lb)' },
    { value: 'oz', label: 'Onza (oz)' },
    { value: 'litro', label: 'Litro (L)' },
    { value: 'mililitro', label: 'Mililitro (ml)' },
    { value: 'galon', label: 'Galón (gal)' },
    { value: 'tonelada', label: 'Tonelada (t)' },
    { value: 'caja', label: 'Caja' },
    { value: 'paquete', label: 'Paquete' },
    { value: 'docena', label: 'Docena' },
    { value: 'metro', label: 'Metro (m)' },
    { value: 'centimetro', label: 'Centímetro (cm)' },
    { value: 'par', label: 'Par' },
    { value: 'rollo', label: 'Rollo' },
    { value: 'saco', label: 'Saco' },
    { value: 'botella', label: 'Botella' },
] as const;

export function isProductUnit(value: string): boolean {
    return productUnits.some((unit) => unit.value === value);
}
