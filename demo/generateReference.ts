// run this file with `node -r esm generateReference.js'

import { fromVariables } from 'convert-to-jcamp';

const variables = {
  x: {
    data: [1, 2, 3, 4],
    symbol: 'X',
    label: 'x value',
    units: 'x unit',
    isDependent: true,
  },
  y: {
    data: [2, 3, 4, 5],
    symbol: 'Y',
    label: 'y value',
    units: 'y unit',
    isDependent: false,
  },
  z: {
    data: [3, 4, 5, 6],
    symbol: 'T',
    label: 't value',
    units: 't unit',
    isDependent: true,
  },
};

const jcamp = fromVariables(variables, {
  meta: {
    meta1: 'value1',
    meta2: 'value2',
  },
  info: {
    title: 'Hello world',
    dataType: 'TEST',
  },
});

console.log(jcamp);
