import { getBestFactor } from '../getBestFactor';
import { describe, it, expect } from 'vitest';

describe('getBestFactor', () => {
  it('integer', () => {
    const y = [1, 2, 3, 4, 5];
    const result = getBestFactor(y);
    expect(result).toBe(1);
  });
  it('integer with factor:1', () => {
    const y = [1, 2, 3, 4, 5];
    const result = getBestFactor(y, { factor: 1 });
    expect(result).toBe(1);
  });
  it('integer with factor:0.5', () => {
    const y = [1, 2, 3, 4, 5];
    const result = getBestFactor(y, { factor: 0.5 });
    expect(result).toBe(0.5);
  });
  it('non-integer factor:0.1', () => {
    const y = [0.1, 0.2, 0.3, 0.4, 0.5];
    const result = getBestFactor(y, { factor: 0.1 });
    expect(result).toBe(0.1);
  });
  it('non-integer maxValue:5', () => {
    const y = [0.1, 0.2, 0.3, 0.4, 0.5];
    const result = getBestFactor(y, { maxValue: 5 });
    expect(result).toBe(0.1);
  });
  it('non-integer negative maxValue:5', () => {
    const y = [-0.1, -0.2, -0.3, -0.4, -0.5];
    const result = getBestFactor(y, { maxValue: 5 });
    expect(result).toBe(0.1);
  });
  it('non-integer negative and positive maxValue:5', () => {
    const y = [-0.1, -0.2, 0.1, 0.2, 0.3, 0.4, 0.5];
    const result = getBestFactor(y, { maxValue: 5 });
    expect(result).toBe(0.1);
  });
  it('non-integer no max value', () => {
    const y = [0.1, 0.2, 0.3, 0.4, 0.5];
    expect(getBestFactor(y)).toBeCloseTo(2.3283064376228985e-10);
  });
});
