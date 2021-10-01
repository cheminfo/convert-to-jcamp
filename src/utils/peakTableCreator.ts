import { DataXY } from 'cheminfo-types';

import { JcampOptions } from '../JcampOptions';

import { getNumber } from './getNumber';

export function peakTableCreator(data: DataXY, options: JcampOptions = {}) {
  const { xFactor = 1, yFactor = 1 } = options.info || {};
  let firstX = Number.POSITIVE_INFINITY;
  let lastX = Number.NEGATIVE_INFINITY;
  let firstY = Number.POSITIVE_INFINITY;
  let lastY = Number.NEGATIVE_INFINITY;

  let lines = [];

  for (let i = 0; i < data.x.length; i++) {
    let x = data.x[i];
    let y = data.y[i];
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
  lines.push(`##FIRSTX=${firstX}`);
  lines.push(`##LASTX=${lastX}`);
  lines.push(`##FIRSTY=${firstY}`);
  lines.push(`##LASTY=${lastY}`);
  lines.push(`##XFACTOR=${xFactor}`);
  lines.push(`##YFACTOR=${yFactor}`);
  lines.push('##PEAK TABLE=(XY..XY)');

  for (let i = 0; i < data.x.length; i++) {
    lines.push(
      `${getNumber(data.x[i], xFactor)} ${getNumber(data.y[i], yFactor)}`,
    );
  }
  return lines;
}
