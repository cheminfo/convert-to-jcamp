import { expect, test } from 'vitest';

import { vectorEncoder } from '../vectorEncoder.ts';

const y = [5, 4, 3, 2, 1, 5, 5, 5, 10, -102, 0];

test('DIFF encoding', () => {
  const encodedData = vectorEncoder(y, 0, 1, 'DIFF');

  expect(encodedData).toBe('0EjjjjM%%Nj12J02\n10@');
});

test('DIFDUP encoding', () => {
  const y = [5, 4, 3, 2, 1, 5, 5, 5, 10, -102, 0];
  const encodedData = vectorEncoder(y, 0, 1, 'DIFDUP');

  expect(encodedData).toBe('0EjVM%TNj12J02\n10@');
});

test('DIFDUP encoding publication example', () => {
  const y = [1, 2, 3, 3, 2, 1, 0, -1, -2, -3];
  const encodedData = vectorEncoder(y, 0, 1, 'DIFDUP');

  expect(encodedData).toBe('0AJT%jX\n9c');
});

test('DIFDUP encoding start 1000', () => {
  const y = [1, 2, 3, 3, 2, 1, 0, -1, -2, -3];
  const encodedData = vectorEncoder(y, 1000, 1, 'DIFDUP');

  expect(encodedData).toBe('1000AJT%jX\n1009c');
});

test('SQZ encoding', () => {
  const y = [5, 4, 3, 2, 1, 5, 5, 5, 10, -102, 0];
  const encodedData = vectorEncoder(y, 0, 1, 'SQZ');

  expect(encodedData).toBe('0EDCBAEEEA0a02\n10@');
});

test('FIX encoding', () => {
  const y = [5, 4, 3, 2, 1, 5, 5, 5, 10, -102, 0];
  const encodedData = vectorEncoder(y, 0, 1, 'FIX');

  expect(encodedData).toBe('0 5 4 3 2 1 5 5 5\n8 10 -102 0');
});

test('PAC encoding', () => {
  const y = [5, 4, 3, 2, 1, 5, 5, 5, 10, -102, 0];
  const encodedData = vectorEncoder(y, 0, 1, 'PAC');

  expect(encodedData).toBe('0+5+4+3+2+1+5+5+5\n8+10-102+0');
});
