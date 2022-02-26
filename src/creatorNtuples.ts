import type { OneLowerCase, MeasurementXYVariables } from 'cheminfo-types';
import { xDivide } from 'ml-spectra-processing';

import { JcampOptions } from './JcampOptions';
import { addInfoData } from './utils/addInfoData';
import { checkNumberOrArray } from './utils/checkNumberOrArray';
import { getExtremeValues } from './utils/getExtremeValues';
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
  const { meta = {}, info = {}, xyEncoding = '' } = options;

  const {
    title = '',
    owner = '',
    origin = '',
    dataType = '',
    xFactor = 1,
    yFactor = 1,
  } = info;

  const symbol = [];
  const varName = [];
  const varType = [];
  const varDim = [];
  const units = [];
  const first = [];
  const last = [];
  const min = [];
  const max = [];

  const keys = Object.keys(variables) as OneLowerCase[];

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    let variable = variables[key];
    if (!variable) continue;

    let name = variable?.label.replace(/ *\[.*/, '');
    let unit = variable?.label.replace(/.*\[(?<units>.*)\].*/, '$<units>');

    const { firstLast, minMax } = getExtremeValues(variable.data);
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
    (e) => !['title', 'owner', 'origin', 'dataType'].includes(e),
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

  if (options.isNMR) {
    let xData = variables.x.data;
    let yData = variables.y.data;
    checkNumberOrArray(xData);
    checkNumberOrArray(yData);
    if (options.isPeakData) {
      header += `##DATA TABLE= (XY..XY), PEAKS\n`;
      for (let point = 0; point < varDim[0]; point++) {
        header += `${xData[point]}, ${yData[point]}\n`;
      }
    } else if (options.isXYData) {
      const firstX = xData[0];
      const lastX = xData[xData.length - 1];
      const deltaX = (lastX - firstX) / xData.length;
      for (const key of ['r', 'i'] as Array<'r' | 'i'>) {
        const variable = variables[key];
        if (variable) {
          checkNumberOrArray(variable.data);
          header += `##PAGE= ${key === 'r' ? 1 : 2}\n`;
          header += `##DATA TABLE= (X++(${
            key === 'r' ? 'R..R' : 'I..I'
          })), XYDATA\n`;
          header += vectorEncoder(
            xDivide(variable.data, yFactor, { output: variable.data }),
            firstX / xFactor,
            deltaX / xFactor,
            xyEncoding,
          );
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

  header += `##NTUPLES= ${dataType}\n`;
  header += '##END=';
  return header;
}
