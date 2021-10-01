import { SpectrumVariables } from 'cheminfo-types';

import { JcampOptions } from './JcampOptions';
import creatorNtuples from './creatorNtuples';
import fromJSON from './fromJSON';

/**
 * Create a jcamp from variables
 * @param {Array<Variable>} [variables={}] - object of variables
 * @return {string} JCAMP of the input
 */
export function fromVariables(
  variables: SpectrumVariables,
  options: JcampOptions = {},
): string {
  const { info = {}, meta = {}, forceNtuples = false } = options;

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
    let x = variables.x;
    let xLabel = x.label || 'x';

    if (variables.x.units) {
      if (xLabel.includes(variables.x.units)) {
        jcampOptions.info.xUnits = xLabel;
      } else {
        jcampOptions.info.xUnits = `${xLabel} (${variables.x.units})`;
      }
    } else {
      jcampOptions.info.xUnits = xLabel;
    }

    let y = variables.y;
    let yLabel = y.label || 'y';

    if (variables.y.units) {
      if (yLabel.includes(variables.y.units)) {
        jcampOptions.info.xUnits = yLabel;
      } else {
        jcampOptions.info.yUnits = `${yLabel} (${variables.y.units})`;
      }
    } else {
      jcampOptions.info.yUnits = yLabel;
    }

    return fromJSON({ x: variables.x.data, y: variables.y.data }, jcampOptions);
  } else {
    return creatorNtuples(variables, options);
  }
}
