import type {
  DoubleArray,
  MeasurementVariable,
  MeasurementXYVariables,
  OneLowerCase,
} from 'cheminfo-types';
import { xMultiply } from 'ml-spectra-processing';

import { JcampOptions } from './JcampOptions';
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

const ntuplesKeys = ['r', 'i'] as Array<keyof NtuplesData>;

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
  Pick<MeasurementXYVariables, 'x' | 'r' | 'i'>
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
    dataType = '',
    nucleus = info.nucleus,
    originFrequency = info['.OBSERVE FREQUENCY'],
  } = info;

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

  const xVariable = variables.x as MeasurementVariable<DoubleArray>;

  let xData = xVariable.data.slice();
  if (xVariable.units?.toLowerCase() === 'ppm') {
    xData = xMultiply(xData, originFrequency);
    xVariable.units = 'Hz';
  }

  const newMeta = {
    ...meta,
    OFFSET: xData[0] / originFrequency,
    XDIM: xData.length,
  };

  const { shiftReference = xData[xData.length - 1] / originFrequency } = info;

  let header = `##TITLE=${title}
##JCAMP-DX=6.00
##DATA TYPE= ${dataType}
##DATA CLASS= NTUPLES
##ORIGIN=${origin}
##OWNER=${owner}
##.SHIFT REFERENCE= INTERNAL, CDCl3, 1, ${shiftReference}\n`;

  const infoKeys = Object.keys(newInfo).filter(
    (key) =>
      !['title', 'owner', 'origin', 'datatype'].includes(
        key.toLocaleLowerCase(),
      ),
  );
  header += addInfoData(newInfo, infoKeys, '##');
  header += addInfoData(newMeta);

  const nbPoints = xData.length;
  const spectralWidth = xData[nbPoints - 1] - xData[0];
  const firstPoint = spectralWidth > 0 ? 0 : -spectralWidth;
  const lastPoint = spectralWidth > 0 ? spectralWidth : 0;

  const symbol = ['X'];
  const varDim = [nbPoints];
  const units = [xVariable.units];
  const varType = ['INDEPENDENT'];
  const factorArray = [spectralWidth / (nbPoints + 1)];
  const varName = [xVariable.label.replace(/ *\[.*/, '') || 'X'];

  const first = [firstPoint];
  const last = [lastPoint];

  const max = [Math.max(lastPoint, firstPoint)];
  const min = [Math.min(lastPoint, firstPoint)];

  for (const key of ntuplesKeys) {
    let variable = variables[key];

    if (!variable) {
      if (key !== 'i') {
        throw new Error(`variable ${key} is mandatory in real/imaginary data`);
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

  return isNTuplesData(variables)
    ? addNtuplesHeader(
        header,
        variables,
        {
          symbol,
          varName,
          varDim,
          first,
          last,
          min,
          max,
          units,
          factor,
          varType,
          factorArray,
        },
        newInfo,
      )
    : isRealData(variables)
    ? addRealData(header, {
        xData,
        yData: variables.r.data,
        xyEncoding,
        info: {
          XUNITS: 'HZ',
          YUNITS: units[1],
          XFACTOR: factorArray[0],
          YFACTOR: factorArray[1],
          DELTAX: (xData[0] - xData[nbPoints - 1]) / (nbPoints + 1),
          FIRSTX: first[0],
          FIRSTY: first[1],
          LASTX: last[0],
          MAXY: max[1],
          MINY: min[1],
          NPOINTS: xData.length,
          XYDATA: '(X++(Y..Y))',
        },
      })
    : header;
}

function addNtuplesHeader(
  header: string,
  variables: NMR1DVariables,
  inputs: Record<string, any>,
  info: Record<string, any>,
) {
  const { dataType = '' } = info;

  const {
    symbol,
    varName,
    varDim,
    first,
    last,
    min,
    max,
    units,
    varType,
    factorArray,
    xyEncoding,
    factor,
  } = inputs;

  header += `##NTUPLES= ${dataType}
##VAR_NAME=  ${varName.join()}
##SYMBOL=    ${symbol.join()}
##VAR_TYPE=  ${varType.join()}
##VAR_DIM=   ${varDim.join()}
##UNITS=     ${units.join()}
##FIRST=     ${first.join()}
##LAST=      ${last.join()}
##MAX=       ${max.join()}
##MIN=       ${min.join()}
##FACTOR=    ${factorArray.join()}\n`;

  for (const key of ['r', 'i'] as const) {
    const variable = variables[key];

    if (!variable) continue;

    checkNumberOrArray(variable.data);
    header += `##PAGE= N=${key === 'r' ? 1 : 2}\n`;
    header += `##DATA TABLE= (X++(${key === 'r' ? 'R..R' : 'I..I'})), XYDATA\n`;
    header += vectorEncoder(
      rescaleAndEnsureInteger(variable.data, factor[key]),
      0,
      1,
      xyEncoding,
    );
    header += '\n';
  }

  header += `##END NTUPLES= ${dataType}\n`;
  header += '##END=';
  return header;
}

function addRealData(header: string, options: any) {
  const { xData, yData, info, xyEncoding } = options;
  header += addInfoData(info, undefined, '##');
  return `${header}
${vectorEncoder(
  rescaleAndEnsureInteger(yData, info.YFACTOR),
  xData.length - 1,
  -1,
  xyEncoding,
)}
##END=`;
}
