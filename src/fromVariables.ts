import { SpectrumVariables } from 'cheminfo-types';
import creatorNtuples from './creatorNtuples';
import fromJSON from './fromJSON';
import { JcampOptions } from './JcampOptions';

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

    jcampOptions.info.xUnits =
      variables.x.units && xLabel.includes(variables.x.units)
        ? xLabel
        : `${xLabel} [${variables.x.units}]`;

    let y = variables.y;
    let yLabel = y.label || 'y';

    jcampOptions.info.yUnits =
      variables.y.units && yLabel.includes(variables.y.units)
        ? yLabel
        : `${yLabel} [${variables.y.units}]`;
    return fromJSON({ x: variables.x.data, y: variables.y.data }, jcampOptions);
  } else {
    return creatorNtuples(variables, options);
  }
}
