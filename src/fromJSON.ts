import { DataXY } from 'cheminfo-types';

import { JcampOptions } from './JcampOptions';
import { peakTableCreator } from './utils/peakTableCreator';
import { xyDataCreator } from './utils/xyDataCreator';

/**
 * Create a jcamp
 * @param data - object of array
 * @param options - metadata object
 * @return - JCAMP of the input
 */
export default function fromJSON(
  data: DataXY,
  options: JcampOptions = {},
): string {
  const { meta = {}, info = {}, xydata = false } = options;

  const {
    title = '',
    owner = '',
    origin = '',
    dataType = '',
    xUnits = '',
    yUnits = '',
    xFactor = 1,
    yFactor = 1,
  } = info;

  data = { x: data.x, y: data.y };

  let header = `##TITLE=${title}
##JCAMP-DX=4.24
##DATA TYPE=${dataType}
##ORIGIN=${origin}
##OWNER=${owner}
##XUNITS=${xUnits}
##YUNITS=${yUnits}\n`;

  for (const key in meta) {
    header +=
      key.toLowerCase() === 'cheminfo'
        ? `##$${key}=${JSON.stringify(meta[key])}\n`
        : `##$${key}=${meta[key]}\n`;
  }

  // we leave the header and utf8 fonts ${header.replace(/[^\t\r\n\x20-\x7F]/g, '')

  return `${header}##NPOINTS=${data.x.length}
${(xydata
  ? xyDataCreator(data, { info: { xFactor, yFactor } })
  : peakTableCreator(data, { info: { xFactor, yFactor } })
).join('\n')}
##END`;
}
