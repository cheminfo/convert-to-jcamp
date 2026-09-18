import type { DataXY } from 'cheminfo-types';

import type { JcampOptions } from '../JcampOptions.ts';

import { rescaleAndEnsureInteger } from './rescaleAndEnsureInteger.ts';
import { vectorEncoder } from './vectorEncoder.ts';

export function xyDataCreator(data: DataXY, options: JcampOptions = {}) {
  const { xyEncoding = 'DIF' } = options;
  const { xFactor = 1, yFactor = 1 } = options.info || {};
  const firstX = data.x[0] as number;
  const lastX = data.x.at(-1) as number;
  const firstY = data.y[0];
  const lastY = data.y.at(-1);
  const nbPoints = data.x.length;
  const deltaX = (lastX - firstX) / (nbPoints - 1);
  const lines = [
    `##FIRSTX=${firstX}`,
    `##LASTX=${lastX}`,
    `##FIRSTY=${firstY}`,
    `##LASTY=${lastY}`,
    `##DELTAX=${deltaX}`,
    `##XFACTOR=${xFactor}`,
    `##YFACTOR=${yFactor}`,
    '##XYDATA=(X++(Y..Y))',
  ];

  const line = vectorEncoder(
    rescaleAndEnsureInteger(data.y, yFactor),
    firstX / xFactor,
    deltaX / xFactor,
    xyEncoding,
  );
  if (line) lines.push(line);
  return lines;
}
