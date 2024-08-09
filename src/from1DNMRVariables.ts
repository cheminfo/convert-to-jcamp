import type {
  DoubleArray,
  MeasurementVariable,
  MeasurementXYVariables,
  OneLowerCase,
} from 'cheminfo-types';

import { JcampOptions } from './JcampOptions';
import { getOneIfArray } from './getOneIfArray';
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
  const {
    onlyReal = false,
    info: currentInfo,
    meta: currentMeta,
    xyEncoding,
  } = options;
  const { isFid, frequencyOffset, DECIM, DSPFVS } = currentInfo;
  const nucleus = getOneIfArray(currentInfo.nucleus);
  const baseFrequency = getOneIfArray(
    currentInfo.baseFrequency || currentInfo.originFrequency,
  );
  const originFrequency = getOneIfArray(currentInfo.originFrequency);

  const { x, re, im } = data;
  const newRe = new Float64Array(re);

  const newIm = !onlyReal && im ? new Float64Array(im) : undefined;
  const newMeta: any = {
    OFFSET: x[0],
  };
  maybeAdd(newMeta, 'SW', currentInfo.spectralWidth);
  maybeAdd(newMeta, 'BF1', baseFrequency);

  if (isFid) {
    // const digitalFiltering = lookupForFilter(spectrum, 'digitalFilter');

    // if (digitalFiltering) {
    //   const {
    //     value: { digitalFilterValue },
    //     flag: digitalFilterIsApplied,
    //   } = digitalFiltering;
    //   if (digitalFilterIsApplied) {
    //     const pointsToShift = Math.floor(digitalFilterValue);
    //     newRe.set(re.slice(re.length - pointsToShift));
    //     newRe.set(re.slice(0, re.length - pointsToShift), pointsToShift);
    //     if (im && newIm) {
    //       newIm.set(im.slice(im.length - pointsToShift));
    //       newIm.set(im.slice(0, im.length - pointsToShift), pointsToShift);
    //     }
    //   }
    // }

    maybeAdd(newMeta, 'GRPDLY', currentInfo.digitalFilter);
    maybeAdd(newMeta, 'DECIM', DECIM);
    maybeAdd(newMeta, 'REVERSE', 'no');
    maybeAdd(newMeta, 'DSPFVS', DSPFVS);
  }
  let shiftReference;
  if (frequencyOffset && baseFrequency) {
    const offset = frequencyOffset / baseFrequency;
    shiftReference = offset + 0.5 * currentInfo.spectralWidth;
  } else {
    shiftReference = x[x.length - 1];
  }

  const isFT = lookupForFilter(spectrum, 'fft')?.flag;
  maybeAdd(newMeta, 'SYMBOL', onlyReal ? '' : currentMeta.SYMBOL);
  maybeAdd(
    newMeta,
    'DATATYPE',
    !currentInfo.isFid || isFT ? 'NMR SPECTRUM' : 'NMR FID',
  );

  const newInfo = {
    '.SHIFT REFERENCE': `INTERNAL, ${String(currentInfo.solvent)}, ${
      currentInfo.isFid ? x.length : 1
    }, ${shiftReference}`,
    NPOINTS: x.length,
    '.OBSERVE NUCLEUS': nucleus,
    '.OBSERVE FREQUENCY': originFrequency,
    dataType: currentInfo.isFid ? `NMR FID` : `NMR SPECTRUM`,
    dataClass: !onlyReal && im ? 'NTUPLES' : 'XYDATA',
  };

  maybeAdd(newInfo, '.SOLVENT', currentInfo.solvent);
  maybeAdd(newInfo, 'owner', currentInfo.owner);

  //@ts-expect-error will be include in next version of nmr-processing
  // const factor = 1 / (info.scaleFactor ?? 1);
  // if (factor) {
  //   maybeAdd(newMeta, 'NC_proc', -Math.log2(factor));
  // }

  // ------- end of new code ----------
  // ------- start the adaptation -------

  const scaleFactor = 1 / (currentInfo.scaleFactor ?? 1);
  if (scaleFactor) {
    maybeAdd(newMeta, 'NC_proc', -Math.log2(scaleFactor));
  }

  const meta = { ...currentMeta, ...newMeta };
  const info = { ...currentInfo, ...newInfo };

  // ----- end of adaptations -------------

  // const { meta = {}, info = {}, xyEncoding = '' } = options;

  const factor =
    'factor' in options
      ? { ...options.factor }
      : ({} as Record<OneLowerCase, number>);

  const {
    title = '',
    owner = '',
    origin = '',
    dataType = '',
    dataClass = '',
    ...resInfo
  } = info;

  if (!('.OBSERVE FREQUENCY' in info)) {
    throw new Error(
      '.OBSERVE FREQUENCY is mandatory into the info object for nmr data',
    );
  }

  const xVariable = variables.x as MeasurementVariable;

  const xData = xVariable.data.slice();

  let header = `##TITLE=${title}
##JCAMP-DX=6.00
##DATA TYPE= ${dataType}
##DATA CLASS= ${dataClass}
##ORIGIN=${origin}
##OWNER=${owner}\n`;

  header += addInfoData(resInfo, { prefix: '##' });
  header += addInfoData(meta);

  const nbPoints = xData.length;
  const spectralWidth = Math.abs(xData[nbPoints - 1] - xData[0]);
  const firstPoint = xData[0] > xData[1] ? spectralWidth : 0;
  const lastPoint = xData[0] > xData[1] ? 0 : spectralWidth;

  const symbol = ['X'];
  const varDim = [nbPoints];
  const units = [xVariable.units];
  const varType = ['INDEPENDENT'];
  const varForm = ['AFFN'];
  const factorArray = [spectralWidth / (nbPoints - 1)];
  const varName = [xVariable.label.replace(/ *\[.*/, '') || 'X'];

  const first = [firstPoint];
  const last = [lastPoint];

  const max = [Math.max(lastPoint, firstPoint)];
  const min = [Math.min(lastPoint, firstPoint)];

  for (const key of ntuplesKeys) {
    const variable = variables[key];

    if (!variable) {
      if (key !== 'i') {
        throw new Error(`variable ${key} is mandatory in real/imaginary data`);
      }
      continue;
    }

    const name = variable?.label.replace(/ *\[.*/, '');
    const unit = variable?.label.replace(/.*\[(?<units>.*)\].*/, '$<units>');

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
    varForm.push('ASDF');
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
          varForm,
          first,
          last,
          min,
          max,
          units,
          factor,
          varType,
          factorArray,
        },
        { dataType, ...resInfo },
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
            DELTAX: xData[1] - xData[0],
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
    varForm,
    factorArray,
    xyEncoding,
    factor,
  } = inputs;

  header += `##NTUPLES= ${dataType}
##VAR_NAME=  ${varName.join()}
##SYMBOL=    ${symbol.join()}
##VAR_TYPE=  ${varType.join()}
##VAR_FORM=  ${varForm.join()}
##VAR_DIM=   ${varDim.join()}
##UNITS=     ${units.join()}
##FACTOR=    ${factorArray.join()}
##FIRST=     ${first.join()}
##LAST=      ${last.join()}
##MIN=       ${min.join()}
##MAX=       ${max.join()}\n`;

  for (const key of ['r', 'i'] as const) {
    const variable = variables[key];

    if (!variable) continue;

    checkNumberOrArray(variable.data);
    header += `##PAGE= N=${key === 'r' ? 1 : 2}\n`;
    header += `##DATA TABLE= (X++(${key === 'r' ? 'R..R' : 'I..I'})), XYDATA\n`;
    header += vectorEncoder(
      rescaleAndEnsureInteger(variable.data, factor[key]),
      first[0] > last[0] ? varDim[0] : 0,
      first[0] > last[0] ? -1 : 1,
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
  header += addInfoData(info, { prefix: '##' });
  return `${header}${vectorEncoder(
    rescaleAndEnsureInteger(yData, info.YFACTOR),
    xData.length - 1,
    -1,
    xyEncoding,
  )}
##END=`;
}

function maybeAdd(
  obj: any,
  name: string,
  value?: string | number | Array<string | number>,
) {
  if (typeof value === 'undefined') return;
  obj[name] = getOneIfArray(value);
}
