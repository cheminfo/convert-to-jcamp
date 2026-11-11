import type { DataXY } from 'cheminfo-types';
import { xMinMaxValues } from 'ml-spectra-processing/x';

import type { JcampOptions } from '../JcampOptions.ts';

import { getNumber } from './getNumber.ts';

/**
 * The records of a `##PEAK TABLE=(XY..XY)`: the first and last point as
 * `##FIRSTX`, `##LASTX`, `##FIRSTY` and `##LASTY`, the ranges as `##MINX`,
 * `##MAXX`, `##MINY` and `##MAXY`, the factors, and one `x y` line per point,
 * each divided by its factor.
 * @param data - The points, in the order they are written.
 * @param options - `info.xFactor` and `info.yFactor`, both 1 by default.
 * @returns The lines.
 */
export function peakTableCreator(data: DataXY, options: JcampOptions = {}) {
  const { xFactor = 1, yFactor = 1 } = options.info || {};
  const lines: string[] = [];
  if (data.x.length > 0) {
    const x = xMinMaxValues(data.x);
    const y = xMinMaxValues(data.y);
    lines.push(
      `##FIRSTX=${data.x[0]}`,
      `##LASTX=${data.x.at(-1)}`,
      `##FIRSTY=${data.y[0]}`,
      `##LASTY=${data.y.at(-1)}`,
      `##MINX=${x.min}`,
      `##MAXX=${x.max}`,
      `##MINY=${y.min}`,
      `##MAXY=${y.max}`,
    );
  }
  lines.push(
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
