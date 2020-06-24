import creatorNtuples from './creatorNtuples';
import { fromJSON } from './fromJSON';

/**
 * Create a jcamp from variables
 * @param {Array<Variable} [variables={}] - object of variables
 * @param {string} [options.info={}] - metadata of the file
 * @param {string} [options.info.title = ''] - title of the file
 * @param {string} [options.info.owner = ''] - owner of the file
 * @param {string} [options.info.origin = ''] - origin of the file
 * @param {string} [options.info.dataType = ''] - type of data
 * @param {object} [options.meta = {}] - comments to add to the file
 * @param {object} [options.forceNtuples = false] - force the ntuples format even if there is only x and y variables
 */
export function fromVariables(variables = {}, options = {}) {
  const { info, meta, forceNtuples } = options;

  let jcampOptions = {
    info,
    meta,
  };

  let keys = Object.keys(variables).map((key) => key.toLowerCase());
  if (
    keys.length === 2 &&
    keys.includes('x') &&
    keys.includes('y') &&
    !forceNtuples
  ) {
    let x = variables.x || variables.X;
    let xLabel = x.label || x.varName || 'x';

    jcampOptions.info.xUnits = xLabel.includes(variables.x.units)
      ? xLabel
      : `${xLabel} [${variables.x.units}]`;

    let y = variables.y || variables.Y;
    let yLabel = y.label || y.varName || 'y';

    jcampOptions.info.yUnits = yLabel.includes(variables.y.units)
      ? yLabel
      : `${yLabel} [${variables.y.units}]`;
    return fromJSON({ x: variables.x.data, y: variables.y.data }, jcampOptions);
  } else {
    return creatorNtuples(variables, options);
  }
}
