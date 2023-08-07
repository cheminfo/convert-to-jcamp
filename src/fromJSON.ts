import { DataXY } from 'cheminfo-types';

import { JcampOptions } from './JcampOptions';
import { addInfoData } from './utils/addInfoData';
import { getBestFactor } from './utils/getBestFactor';
import { peakTableCreator } from './utils/peakTableCreator';
import { xyDataCreator } from './utils/xyDataCreator';

/**
 * Create a jcamp
 * @param data object of array
 * @param [options={meta:{},info:{}} - metadata object
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
    ...resInfo
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

  header += addInfoData(resInfo, { prefix: '##' });
  header += addInfoData(meta);

  // we leave the header and utf8 fonts ${header.replace(/[^\t\n\x20-\x7F]/g, '')

  if (xyEncoding) {
    xFactor = getBestFactor(data.x, { factor: xFactor });
    yFactor = getBestFactor(data.y, { factor: yFactor });
    return `${header}##NPOINTS=${data.x.length}
${xyDataCreator(data, { info: { xFactor, yFactor }, xyEncoding }).join('\n')}
##END=`;
  } else {
    if (xFactor === undefined) xFactor = 1;
    if (yFactor === undefined) yFactor = 1;
    if (xFactor !== 1) {
      //@ts-expect-error xFactor is always defined
      data.x = data.x.map((value) => value / xFactor);
    }
    if (yFactor !== 1) {
      //@ts-expect-error yFactor is always defined
      data.y = data.y.map((value) => value / yFactor);
    }
    return `${header}##NPOINTS=${data.x.length}
${peakTableCreator(data, { info: { xFactor, yFactor } }).join('\n')}
##END=`;
  }
}
