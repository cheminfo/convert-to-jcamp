import { peakTableCreator } from './utils/peakTableCreator';
import { xyDataCreator } from './utils/xyDataCreator';
import JcampOptions  from "./JcampOptions";

/**
 * Create a jcamp
 * @param {object} data object of array
 * @param {object} [options={}] metadata object
 * @param {string} [options.info={}] metadata of the file
 * @param {string} [options.info.title=''] title of the file
 * @param {string} [options.info.owner=''] owner of the file
 * @param {string} [options.info.origin=''] origin of the file
 * @param {string} [options.info.dataType=''] type of data
 * @param {string} [options.info.xUnits=''] units for the x axis for variables===undefined
 * @param {string} [options.info.yUnits=''] units for the y axis for variables===undefined
 * @param {number} [options.info.xFactor=1] factor to multiply X values
 * @param {number} [options.info.yFactor=1] factor to multiply Y values
 * @param {object} [options.meta={}] comments to add to the file
 * @param {boolean} [options.xydata=false] Use XYDATA format. Will use first / last X and equidistant Xs values if true
 * @return {string} JCAMP of the input
 */
export default function fromJSON(data, options:JcampOptions = {}):string {   
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
  ? xyDataCreator(data, { xFactor, yFactor })
  : peakTableCreator(data, { xFactor, yFactor })
).join('\n')}
##END`;
}
