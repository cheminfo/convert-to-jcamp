// run this file with `node -r esm generateReference.js'

import { writeFileSync } from 'fs';
import { join } from 'path';

import { fromJSON } from '../src';

let peaks = [0, 1, 2, 3, 4, 5, 6, 7, 8];
let from = -1;
let to = 9;
let nbPoints = 100001;
let peakWidth = 5;
let intensity = 1000;

let step = (to - from) / (nbPoints - 1);
let beforeAfter = (peakWidth - 1) / 2;

let ys = [];
let xs = [];

for (let i = 0; i < nbPoints; i++) {
  xs.push(from + step * i);
  ys.push(0);
}

for (let peak of peaks) {
  let index = Math.round(peak - from) / step;
  ys[index] = intensity;
  for (let i = 1; i <= beforeAfter; i++) {
    let currentIndensity = (intensity / beforeAfter) * (beforeAfter - i);
    ys[index + i] = currentIndensity;
    ys[index - i] = currentIndensity;
  }
}

let jcamp = fromJSON(
  { x: xs, y: ys },
  {
    title: 'test',
    owner: 'convert-to-jcamp',
    origin: 'Generated spectrum using convert-to-jcamp',
    type: 'NMR SPECTRUM',
    xUnit: 'd (ppm)',
    yUnit: 'relative abundance',
  },
);

writeFileSync(join(__dirname, 'test.jdx'), jcamp, 'utf8');
