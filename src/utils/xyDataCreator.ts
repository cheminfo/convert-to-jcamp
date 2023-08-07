import { DataXY } from 'cheminfo-types';

import { JcampOptions } from '../JcampOptions';

import { rescaleAndEnsureInteger } from './rescaleAndEnsureInteger';
import { vectorEncoder } from './vectorEncoder';

export function xyDataCreator(data: DataXY, options: JcampOptions = {}) {
  const { xyEncoding = 'DIF' } = options;
  const { xFactor = 1, yFactor = 1 } = options.info || {};
  const firstX = data.x[0];
  const lastX = data.x[data.x.length - 1];
  const firstY = data.y[0];
  const lastY = data.y[data.y.length - 1];
  const nbPoints = data.x.length;
  const deltaX = (lastX - firstX) / (nbPoints - 1);
  const lines = [];

  lines.push(`##FIRSTX=${firstX}`);
  lines.push(`##LASTX=${lastX}`);
  lines.push(`##FIRSTY=${firstY}`);
  lines.push(`##LASTY=${lastY}`);
  lines.push(`##DELTAX=${deltaX}`);
  lines.push(`##XFACTOR=${xFactor}`);
  lines.push(`##YFACTOR=${yFactor}`);
  lines.push('##XYDATA=(X++(Y..Y))');

  const line = vectorEncoder(
    rescaleAndEnsureInteger(data.y, yFactor),
    firstX / xFactor,
    deltaX / xFactor,
    xyEncoding,
  );
  if (line) lines.push(line);
  return lines;
}
