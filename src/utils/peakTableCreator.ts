import type { DataXY } from 'cheminfo-types';

import type { JcampOptions } from '../JcampOptions.ts';

import { getNumber } from './getNumber.ts';

export function peakTableCreator(data: DataXY, options: JcampOptions = {}) {
  const { xFactor = 1, yFactor = 1 } = options.info || {};
  let firstX = Infinity;
  let lastX = -Infinity;
  let firstY = Infinity;
  let lastY = -Infinity;

  const lines = [];

  for (let i = 0; i < data.x.length; i++) {
    const x = data.x[i] as number;
    const y = data.y[i] as number;
    if (firstX > x) {
      firstX = x;
    }
    if (lastX < x) {
      lastX = x;
    }
    if (firstY > y) {
      firstY = y;
    }
    if (lastY < y) {
      lastY = y;
    }
  }
  lines.push(
    `##FIRSTX=${firstX}`,
    `##LASTX=${lastX}`,
    `##FIRSTY=${firstY}`,
    `##LASTY=${lastY}`,
    `##XFACTOR=${xFactor}`,
    `##YFACTOR=${yFactor}`,
    '##PEAK TABLE=(XY..XY)',
  );

  for (let i = 0; i < data.x.length; i++) {
    lines.push(
      `${getNumber(data.x[i] as number, xFactor)} ${getNumber(data.y[i] as number, yFactor)}`,
    );
  }
  return lines;
}
