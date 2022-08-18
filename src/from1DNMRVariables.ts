import type {
  MeasurementVariable,
  MeasurementXYVariables,
} from 'cheminfo-types';

import { JcampOptions } from './JcampOptions';
import { addInfoData } from './utils/addInfoData';
import { checkNumberOrArray } from './utils/checkNumberOrArray';
import { getBestFactor } from './utils/getBestFactor';
import { getExtremeValues } from './utils/getExtremeValues';
import { rescaleAndEnsureInteger } from './utils/rescaleAndEnsureInteger';
import { vectorEncoder } from './utils/vectorEncoder';

export interface PeakData {
  x: MeasurementVariable;
  y: MeasurementVariable;
}

export interface NtuplesData {
  x: MeasurementVariable;
  r: MeasurementVariable;
  i: MeasurementVariable;
}

function isPeakData(
  variables: Partial<MeasurementXYVariables>,
): variables is PeakData {
  return 'y' in variables && 'x' in variables;
}

function isNTuplesData(
  variables: Partial<MeasurementXYVariables>,
): variables is NtuplesData {
  return 'r' in variables && 'i' in variables;
}

/**
 * Create a jcamp of 1D NMR data by variables x and y or x, r, i
 * @param variables - Variables to convert to jcamp
 * @param [options={}] - options that allows to add meta data in the jcamp
 * @return JCAMP-DX text file corresponding to the variables
 */
export default function from1DNMRVariables(
  variables: Partial<MeasurementXYVariables>,
  options: JcampOptions,
): string {
  const { meta = {}, info = {}, xyEncoding = '', factors = {} } = options;

  const { title = '', owner = '', origin = '', dataType = '' } = info;

  const symbol = [];
  const varName = [];
  const varType = [];
  const varDim = [];
  const units = [];
  const first = [];
  const last = [];
  const min = [];
  const max = [];
  const factorArray = [];

  const keys = isPeakData(variables)
    ? (['x', 'y'] as const)
    : (['x', 'r', 'i'] as const);

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    let variable = variables[key];

    if (!variable) {
      throw new Error(
        `variable ${key} is mandatory in ${
          isPeakData(variables) ? 'peak' : 'real/imaginary'
        } data`,
      );
    }

    let name = variable?.label.replace(/ *\[.*/, '');
    let unit = variable?.label.replace(/.*\[(?<units>.*)\].*/, '$<units>');

    const { firstLast, minMax } = getExtremeValues(variable.data);
    factors[key] = getBestFactor(variable.data, {
      factor: factors[key],
      minMax,
    });

    const currentFactor = factors[key];
    factorArray.push(currentFactor);
    symbol.push(variable.symbol || key);
    varName.push(name || key);
    varDim.push(variable.data.length);
    first.push(firstLast.first);
    last.push(firstLast.last);
    max.push(minMax.max);
    min.push(minMax.min);

    if (variable.isDependent !== undefined) {
      varType.push(variable.isDependent ? 'DEPENDENT' : 'INDEPENDENT');
    } else {
      varType.push(
        variable.isDependent !== undefined
          ? !variable.isDependent
          : i === 0
          ? 'INDEPENDENT'
          : 'DEPENDENT',
      );
    }

    units.push(variable.units || unit || '');
  }

  let header = `##TITLE=${title}
##JCAMP-DX=6.00
##DATA TYPE=${dataType}
##DATA CLASS= NTUPLES
##ORIGIN=${origin}
##OWNER=${owner}\n`;

  const infoKeys = Object.keys(info).filter(
    (e) =>
      !['title', 'owner', 'origin', 'datatype'].includes(e.toLocaleLowerCase()),
  );
  header += addInfoData(info, infoKeys, '##');
  header += addInfoData(meta);

  header += `##NTUPLES= ${dataType}
##VAR_NAME=  ${varName.join()}
##SYMBOL=    ${symbol.join()}
##VAR_TYPE=  ${varType.join()}
##VAR_DIM=   ${varDim.join()}
##UNITS=     ${units.join()}
##FIRST=     ${first.join()}
##LAST=      ${last.join()}
##MIN=       ${min.join()}
##MAX=       ${max.join()}\n`;

  if (isPeakData(variables)) {
    let xData = variables.x.data;
    let yData = variables.y.data;
    checkNumberOrArray(yData);
    header += `##DATA TABLE= (XY..XY), PEAKS\n`;
    for (let point = 0; point < varDim[0]; point++) {
      header += `${xData[point]}, ${yData[point]}\n`;
    }
  } else if (isNTuplesData(variables)) {
    for (const key of ['r', 'i'] as const) {
      const variable = variables[key];
      checkNumberOrArray(variable.data);
      header += `##FACTOR=    ${factorArray.join()}\n`;
      header += `##PAGE= N=${key === 'r' ? 1 : 2}\n`;
      header += `##DATA TABLE= (X++(${
        key === 'r' ? 'R..R' : 'I..I'
      })), XYDATA\n`;
      header += vectorEncoder(
        rescaleAndEnsureInteger(variable.data, factors[key]),
        0,
        1,
        xyEncoding,
      );
      header += '\n';
    }
  }

  header += `##END NTUPLES= ${dataType}\n`;
  header += '##END=\n##END=';
  return header;
}
