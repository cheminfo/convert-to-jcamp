import type {
  DoubleArray,
  MeasurementVariable,
  MeasurementXYVariables,
  OneLowerCase,
} from 'cheminfo-types';
import { xMultiply } from 'ml-spectra-processing';

import { JcampOptions } from './JcampOptions';
import { fromJSON } from './fromJSON';
import { addInfoData } from './utils/addInfoData';
import { checkNumberOrArray } from './utils/checkNumberOrArray';
import { getBestFactor } from './utils/getBestFactor';
import { getExtremeValues } from './utils/getExtremeValues';
import { rescaleAndEnsureInteger } from './utils/rescaleAndEnsureInteger';
import { vectorEncoder } from './utils/vectorEncoder';

type NtuplesData<DataType extends DoubleArray = DoubleArray> = Record<
  'x' | 'r' | 'i',
  MeasurementVariable<DataType>
>;
type RealData<DataType extends DoubleArray = DoubleArray> = Record<
  'x' | 'r',
  MeasurementVariable<DataType>
>;
type PeakData<DataType extends DoubleArray = DoubleArray> = Record<
  'x' | 'y',
  MeasurementVariable<DataType>
>;

const peakDataKeys = ['x', 'y'] as Array<keyof PeakData>;
const ntuplesKeys = ['r', 'i'] as Array<keyof NtuplesData>;

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

function isRealData(
  variables: Partial<MeasurementXYVariables>,
): variables is RealData {
  return 'r' in variables && !('i' in variables);
}

export type NMR1DVariables = Partial<
  Pick<MeasurementXYVariables, 'x' | 'y' | 'r' | 'i'>
>;
/**
 * Create a jcamp of 1D NMR data by variables x and y or x, r, i
 * @param variables - Variables to convert to jcamp
 * @param [options={}] - options that allows to add meta data in the jcamp
 * @return JCAMP-DX text file corresponding to the variables
 */
export function from1DNMRVariables(
  variables: NMR1DVariables,
  options: JcampOptions,
): string {
  const { meta = {}, info = {}, xyEncoding = '' } = options;

  const factor =
    'factor' in options
      ? { ...options.factor }
      : ({} as Record<OneLowerCase, number>);

  const {
    title = '',
    owner = '',
    origin = '',
    dataType = 'NMR SPECTRUM',
    nucleus = info['.OBSERVE NUCLEUS'],
    originFrequency = info['.OBSERVE FREQUENCY'],
  } = info;

  if (isRealData(variables)) {
    return fromJSON(
      { x: variables.x.data, y: variables.r.data },
      { ...options, info: { ...options.info, dataType } },
    );
  }

  if (!originFrequency) {
    throw new Error(
      '.OBSERVE FREQUENCY is mandatory into the info object for nmr data',
    );
  }

  const newInfo = {
    '.OBSERVE FREQUENCY': originFrequency,
    '.OBSERVE NUCLEUS': nucleus,
    ...info,
  };

  const newVariables = checkDescending(variables);
  const xVariable = newVariables.x as MeasurementVariable<DoubleArray>;

  let xData = xVariable.data;
  if (xVariable.units?.toLowerCase() !== 'hz') {
    xData = xMultiply(xData, originFrequency);
  }

  const nbPoints = xData.length;
  const spectralWidth = xData[0] - xData[nbPoints - 1];
  const symbol = ['X'];
  const varName = [xVariable.label.replace(/ *\[.*/, '') || 'X'];
  const varType = ['INDEPENDENT'];
  const varDim = [xData.length];
  const units = ['Hz'];
  const first = [spectralWidth];
  const last = [0];
  const min = [0];
  const max = [spectralWidth];
  const factorArray = [xData.length / spectralWidth];

  const keys = isPeakData(newVariables) ? peakDataKeys : ntuplesKeys;

  for (const key of keys) {
    let variable = newVariables[key];

    if (!variable) {
      if (key !== 'i') {
        throw new Error(
          `variable ${key} is mandatory in ${
            isPeakData(newVariables) ? 'peak' : 'real/imaginary'
          } data`,
        );
      }
      continue;
    }

    let name = variable?.label.replace(/ *\[.*/, '');
    let unit = variable?.label.replace(/.*\[(?<units>.*)\].*/, '$<units>');

    const { firstLast, minMax } = getExtremeValues(variable.data);
    factor[key] = getBestFactor(variable.data, {
      factor: factor[key],
      minMax,
    });

    const currentFactor = factor[key];
    factorArray.push(currentFactor || 1);
    symbol.push(variable.symbol || key);
    varName.push(name || key);
    varDim.push(variable.data.length);
    first.push(firstLast.first);
    last.push(firstLast.last);
    max.push(minMax.max);
    min.push(minMax.min);
    varType.push('DEPENDENT');

    units.push(variable.units || unit || '');
  }

  let header = `##TITLE=${title}
##JCAMP-DX=6.00
##DATA TYPE=${dataType}
##DATA CLASS= NTUPLES
##ORIGIN=${origin}
##OWNER=${owner}\n`;

  const infoKeys = Object.keys(newInfo).filter(
    (e) =>
      !['title', 'owner', 'origin', 'datatype'].includes(e.toLocaleLowerCase()),
  );
  header += addInfoData(newInfo, infoKeys, '##');
  header += addInfoData(meta);

  header += `##NTUPLES= ${dataType}
##VAR_NAME=  ${varName.join()}
##SYMBOL=    ${symbol.join()}
##VAR_TYPE=  ${varType.join()}
##VAR_DIM=   ${varDim.join()}
##UNITS=     ${units.join()}
##FIRST=     ${first.join()}
##LAST=      ${last.join()}
##MAX=       ${max.join()}
##MIN=       ${min.join()}\n`;

  if (isPeakData(newVariables)) {
    let xData = newVariables.x.data;
    let yData = newVariables.y.data;
    checkNumberOrArray(yData);
    header += `##DATA TABLE= (XY..XY), PEAKS\n`;
    for (let point = 0; point < varDim[0]; point++) {
      header += `${xData[point]}, ${yData[point]}\n`;
    }
  } else if (isNTuplesData(newVariables)) {
    for (const key of ['r', 'i'] as const) {
      const variable = newVariables[key];

      if (!variable) continue;

      checkNumberOrArray(variable.data);
      header += `##FACTOR=    ${factorArray.join()}\n`;
      header += `##PAGE= N=${key === 'r' ? 1 : 2}\n`;
      header += `##DATA TABLE= (X++(${
        key === 'r' ? 'R..R' : 'I..I'
      })), XYDATA\n`;
      header += vectorEncoder(
        rescaleAndEnsureInteger(variable.data, factor[key]),
        xData.length - 1,
        -1,
        xyEncoding,
      );
      header += '\n';
    }
  }

  header += `##END NTUPLES= ${dataType}\n`;
  header += '##END=';
  return header;
}

function checkDescending(variables: NMR1DVariables) {
  const xVariable = variables.x as MeasurementVariable<DoubleArray>;
  const reverse = xVariable.data[0] < xVariable.data[1];

  if (!reverse) return variables;

  const newVariables = JSON.parse(
    JSON.stringify(variables, (key, value) =>
      ArrayBuffer.isView(value) ? Array.from(value as any) : value,
    ),
  );
  for (const key of ['x', 'r', 'i'] as Array<keyof NtuplesData>) {
    newVariables[key]?.data.reverse();
  }
  return newVariables;
}
