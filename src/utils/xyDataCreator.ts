import { getNumber } from './getNumber';
import JcampOptions from '../JcampOptions';
import { DataXY } from 'cheminfo-types';

export function xyDataCreator(data: DataXY, options: JcampOptions = {}) {
  const { xFactor = 1, yFactor = 1 } = options.info || {};
  let firstX = data.x[0];
  let lastX = data.x[data.x.length - 1];
  let firstY = data.y[0];
  let lastY = data.y[data.y.length - 1];
  let nbPoints = data.x.length;
  let deltaX = (lastX - firstX) / (nbPoints - 1);
  let lines = [];

  lines.push(`##FIRSTX=${firstX}`);
  lines.push(`##LASTX=${lastX}`);
  lines.push(`##FIRSTY=${firstY}`);
  lines.push(`##LASTY=${lastY}`);
  lines.push(`##DELTAX=${deltaX}`);
  lines.push(`##XFACTOR=${xFactor}`);
  lines.push(`##YFACTOR=${yFactor}`);
  lines.push(`##DELTAX=${xFactor}`);
  lines.push('##XYDATA=(X++(Y..Y))');

  let line = String(data.x[0]);
  for (let i = 0; i < data.x.length; i++) {
    line += ` ${getNumber(data.y[i], yFactor)}`;
    if (line.length > 70) {
      lines.push(line);
      if (i < data.x.length - 1) {
        line = String(getNumber(data.x[0] + i * deltaX, xFactor));
      } else {
        line = '';
      }
    }
  }
  if (line) lines.push(line);
  return lines;
}
