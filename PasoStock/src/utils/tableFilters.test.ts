import { describe, expect, it } from 'vitest';
import { matchesColumnFilter } from './tableFilters';

describe('matchesColumnFilter', () => {
    it('matches text without accents or case sensitivity', () => {
        expect(matchesColumnFilter('Bebidas frías', 'bebidas')).toBe(true);
    });

    it('trims the filter and supports numeric values', () => {
        expect(matchesColumnFilter(120, ' 12 ')).toBe(true);
    });

    it('returns false when the value does not contain the filter', () => {
        expect(matchesColumnFilter('Harina', 'arroz')).toBe(false);
    });
});
