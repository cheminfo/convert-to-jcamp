import { MeasurementXYVariables } from 'cheminfo-types';

import { JcampOptions } from './JcampOptions';
import creatorNtuples from './creatorNtuples';
import { fromJSON } from './fromJSON';
import { checkNumberOrArray } from './utils/checkNumberOrArray';

/**
 * Create a jcamp from variables
 */
export function fromVariables(
  /** object of variables */
  variables: MeasurementXYVariables,
  options: JcampOptions = {},
): string {
  const { info = {}, meta = {}, forceNtuples = false } = options;

  const jcampOptions = {
    info,
    meta,
  };

  const keys = Object.keys(variables).map((key) => key.toLowerCase());
  if (!forceNtuples && keys.length === 2) {
    const x = variables.x;
    const xLabel = x.label || 'x';

    if (variables.x.units) {
      if (xLabel.includes(variables.x.units)) {
        jcampOptions.info.xUnits = xLabel;
      } else {
        jcampOptions.info.xUnits = `${xLabel} (${variables.x.units})`;
      }
    } else {
      jcampOptions.info.xUnits = xLabel;
    }

    const y = variables.y;
    const yLabel = y.label || 'y';

    if (variables.y.units) {
      if (yLabel.includes(variables.y.units)) {
        jcampOptions.info.xUnits = yLabel;
      } else {
        jcampOptions.info.yUnits = `${yLabel} (${variables.y.units})`;
      }
    } else {
      jcampOptions.info.yUnits = yLabel;
    }

    const xData = variables.x.data;
    const yData = variables.y.data;

    checkNumberOrArray(xData);
    checkNumberOrArray(yData);

    return fromJSON({ x: xData, y: yData }, jcampOptions);
  } else {
    return creatorNtuples(variables, options);
  }
}
