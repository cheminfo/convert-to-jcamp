import creatorNtuples from './creatorNtuples';

interface SpectrumInfo {
  /**
   * title of the file
   * @default ''
   */
  title?: string;
  /**
   * owner of the file
   * @default ''
   */
  owner?: string;
  /**
   * origin of the file
   * @default ''
   */
  origin?: string;
  /**
    * type of data
    * @default ''
    */
  dataType?: string;

  xUnits: number;
  yUnits: number
}

interface JcampOptions {
  /**
   * metadata of the file
   * @default {} 
   */
  info?: SpectrumInfo;
  /**
   * comments to add to the file
   * @default {} 
   */
  meta?: Record<string, any>;
  /**
   * force the ntuples format even if there is only x and y variables
   * @default false
   */
  forceNtuples?: boolean;
}

/**
 * Create a jcamp from variables
 * @param {Array<Variable>} [variables={}] - object of variables
 */
export function fromVariables(variables: Record<string, any> = {}, options: JcampOptions = {}) {
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
    let x = variables.x;
    let xLabel = x.label || x.name || 'x';

    jcampOptions.info.xUnits = xLabel.includes(variables.x.units)
      ? xLabel
      : `${xLabel} [${variables.x.units}]`;

    let y = variables.y;
    let yLabel = y.label || y.name || 'y';

    jcampOptions.info.yUnits = yLabel.includes(variables.y.units)
      ? yLabel
      : `${yLabel} [${variables.y.units}]`;
    return fromJSON({ x: variables.x.data, y: variables.y.data }, jcampOptions);
  } else {
    return creatorNtuples(variables, options);
  }
}
