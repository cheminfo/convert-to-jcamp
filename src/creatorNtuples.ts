import type { OneLowerCase, MeasurementXYVariables } from 'cheminfo-types';

import { JcampOptions } from './JcampOptions';
import { addInfoData } from './utils/addInfoData';
import { checkNumberOrArray } from './utils/checkNumberOrArray';
import { getBestFactor } from './utils/getBestFactor';
import { getExtremeValues } from './utils/getExtremeValues';
import { rescaleAndEnsureInteger } from './utils/rescaleAndEnsureInteger';
import { vectorEncoder } from './utils/vectorEncoder';

/**
 * Parse from a xyxy data array
 * @param variables - Variables to convert to jcamp
 * @param [options={}] - options that allows to add meta data in the jcamp
 * @return JCAMP-DX text file corresponding to the variables
 */
export default function creatorNtuples(
  variables: MeasurementXYVariables,
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

  const keys = Object.keys(variables) as OneLowerCase[];

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    let variable = variables[key];
    if (!variable) continue;

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
##FACTOR=    ${factorArray.join()}
##FIRST=     ${first.join()}
##LAST=      ${last.join()}
##MIN=       ${min.join()}
##MAX=       ${max.join()}\n`;

  if (options.isNMR) {
    let xData = variables.x.data;
    checkNumberOrArray(xData);
    if (options.isPeakData) {
      let yData = variables.y.data;
      checkNumberOrArray(yData);
      header += `##DATA TABLE= (XY..XY), PEAKS\n`;
      for (let point = 0; point < varDim[0]; point++) {
        header += `${xData[point]}, ${yData[point]}\n`;
      }
    } else if (options.isXYData) {
      for (const key of ['r', 'i'] as Array<'r' | 'i'>) {
        const variable = variables[key];
        if (variable) {
          checkNumberOrArray(variable.data);
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
    }
  } else {
    header += `##PAGE= N=1\n`;
    header += `##DATA TABLE= (${symbol.join('')}..${symbol.join('')}), PEAKS\n`;
    for (let i = 0; i < variables.x.data.length; i++) {
      let point = [];
      for (let key of keys) {
        let variable = variables[key];
        if (!variable) continue;
        point.push(variable.data[i]);
      }
      header += `${point.join('\t')}\n`;
    }
  }

  header += `##END NTUPLES= ${dataType}\n`;
  header += '##END=\n##END=';
  return header;
}
