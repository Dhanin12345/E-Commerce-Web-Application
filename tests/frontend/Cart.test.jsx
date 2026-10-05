import { describe, it, expect } from 'vitest';
import { formatCurrency } from '../../frontend/src/utils/formatCurrency';

describe('Cart Utilities and Calculations', () => {
  it('formats USD currency correctly', () => {
    expect(formatCurrency(129.99)).toBe('$129.99');
    expect(formatCurrency(0)).toBe('$0.00');
    expect(formatCurrency('49.5')).toBe('$49.50');
  });
});
