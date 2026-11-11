import type { DataXY } from 'cheminfo-types';

import type { JcampOptions } from './JcampOptions.ts';
import { addInfoData } from './utils/addInfoData.ts';
import { getBestFactor } from './utils/getBestFactor.ts';
import { peakTableCreator } from './utils/peakTableCreator.ts';
import { xyDataCreator } from './utils/xyDataCreator.ts';

/**
 * Create a jcamp
 * @param data - object of array
 * @param - - [options={meta:{},info:{}} - metadata object
 * @param options
 * @returns JCAMP of the input
 */
export function fromJSON(data: DataXY, options: JcampOptions = {}): string {
  const { meta = {}, info = {}, xyEncoding } = options;

  const {
    title = '',
    owner = '',
    origin = '',
    dataType = '',
    xUnits = '',
    yUnits = '',
    // Keep xFactor and yFactor out of resultInfo: the data section writes them
    // as ##XFACTOR and ##YFACTOR.
    xFactor: _xFactor,
    yFactor: _yFactor,
    ...resultInfo
  } = info;

  let { xFactor, yFactor } = info;

  data = { x: data.x, y: data.y };

  let header = `##TITLE=${title}
##JCAMP-DX=4.24
##DATA TYPE=${dataType}
##ORIGIN=${origin}
##OWNER=${owner}
##XUNITS=${xUnits}
##YUNITS=${yUnits}\n`;

  header += addInfoData(resultInfo, { prefix: '##' });
  header += addInfoData(meta);

  // we leave the header and utf8 fonts ${header.replace(/[^\t\n\x20-\x7F]/g, '')

  if (xyEncoding) {
    xFactor = getBestFactor(data.x, { factor: xFactor });
    yFactor = getBestFactor(data.y, { factor: yFactor });
    return `${header}##NPOINTS=${data.x.length}
${xyDataCreator(data, { info: { xFactor, yFactor }, xyEncoding }).join('\n')}
##END=`;
  }
  if (xFactor === undefined) xFactor = 1;
  if (yFactor === undefined) yFactor = 1;
  return `${header}##NPOINTS=${data.x.length}
${peakTableCreator(data, { info: { xFactor, yFactor } }).join('\n')}
##END=`;
}
