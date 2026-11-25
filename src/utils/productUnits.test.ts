import { describe, expect, it } from 'vitest';
import { isProductUnit, productUnits } from './productUnits';

describe('product units', () => {
    it('contains the default unit used by new products', () => {
        expect(productUnits.some((unit) => unit.value === 'unidad')).toBe(true);
    });

    it('recognizes supported and custom units separately', () => {
        expect(isProductUnit('kg')).toBe(true);
        expect(isProductUnit('personalizada')).toBe(false);
    });
});
