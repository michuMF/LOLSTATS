import { describe, it, expect } from 'vitest';
// Assuming a hypothetical formatter function
const formatKDA = (k: number, d: number, a: number) => `${k}/${d}/${a}`;
describe('formatKDA', () => {
    it('formats correctly', () => {
        expect(formatKDA(10, 2, 5)).toBe('10/2/5');
    });
});