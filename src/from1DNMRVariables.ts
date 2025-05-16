import type {
  DoubleArray,
  MeasurementVariable,
  MeasurementXYVariables,
  NumberArray,
  OneLowerCase,
} from 'cheminfo-types';
import { xMultiply } from 'ml-spectra-processing';

import { JcampInfo, JcampOptions } from './JcampOptions';
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

export interface NmrJcampInfo extends JcampInfo {
  /**
   * used internally to scale the x axis
   */
  isFid: boolean;
  /**
   * the number of points to be shifted at the moment to apply FFT, only needed for RAW data
   */
  digitalFilter?: number;
  /**
   * metadata to calculate the digitalFilter value
   */
  decim?: number;
  /**
   * metadata to calculate the digitalFilter value
   */
  dspfvs?: number;
  /**
   * origin frequency of the spectrum
   */
  originFrequency: number;
}

export interface NmrJcampOptions
  extends Pick<JcampOptions, 'meta' | 'xyEncoding'> {
  /**
   * NMR-specific metadata and parameters used for JCAMP generation.
   * - isFid: Whether the data is a free induction decay (FID) or spectrum.
   * - digitalFilter: Number of points to shift for FFT (raw data only).
   * - decim: Decimation factor for digital filter calculation.
   * - dspfvs: DSP firmware version for digital filter calculation.
   * - originFrequency: Origin frequency of the spectrum (MHz).
   * - frequencyOffset: Frequency offset for referencing (optional).
   * - nucleus: Observed nucleus (e.g., '1H', '13C').
   * - baseFrequency: Base frequency for referencing (optional).
   * - spectralWidth: Spectral width of the experiment (Hz).
   * - solvent: Solvent used in the experiment (optional).
   * - owner: Owner of the data (optional).
   * - dataType: Type of data (optional).
   * - scaleFactor: Scaling factor applied to the data (optional).
   */
  nmrInfo: NmrJcampInfo;
  /**
   * standardize meta data defined in a nmr jcamp like
   * @default {}
   */
  info?: Record<string, any>;
  /**
   * factor to scale the variables data
   */
  factor?: Record<OneLowerCase, number>;
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

export type NMR1DVariables = Pick<MeasurementXYVariables, 'x' | 'r'> &
  Partial<Pick<MeasurementXYVariables, 'i'>>;

/**
 * Create a jcamp of 1D NMR data by variables x and y or x, r, i
 * @param variables - Variables to convert to jcamp
 * @param [options={}] - options that allows to add meta data in the jcamp
 * @return JCAMP-DX text file corresponding to the variables
 */
export function from1DNMRVariables(
  variables: NMR1DVariables,
  options: NmrJcampOptions,
): string {
  const {
    info: infoInput = {},
    meta: currentMeta = {},
    xyEncoding,
    nmrInfo,
  } = options;
  const {
    isFid,
    title,
    frequencyOffset,
    decim,
    dspfvs,
    nucleus,
    originFrequency: originFreq,
    baseFrequency: baseFreq,
    spectralWidth: nmrSpectralWidth,
    solvent,
    owner: nmrOwner,
    dataType: nmrDataType,
    dataClass = variables.i ? 'NTUPLES' : 'XYDATA',
    scaleFactor,
    digitalFilter,
    ...currentInfo
  } = nmrInfo;
  const baseFrequency = getOneIfArray(baseFreq || originFreq);

  const originFrequency = getOneIfArray(
    originFreq || infoInput['.OBSERVE FREQUENCY'],
  );

  if (!originFrequency) {
    throw new Error(
      'originFrequency is mandatory into the info object for nmr data',
    );
  }

  const xVariable = variables.x;
  const x = xVariable.data.slice();
  const xData = isFid ? x : xMultiply(x, originFrequency);

  // --- Extracted: Metadata construction ---
  const newMeta = constructMeta(
    xData,
    isFid,
    nmrSpectralWidth,
    baseFrequency,
    originFrequency,
    digitalFilter,
    decim,
    dspfvs,
    currentMeta,
    variables,
  );
  const meta = { ...currentInfo, ...currentMeta, ...newMeta };

  // --- Extracted: Scaling logic ---
  applyScaling(variables, scaleFactor, meta);

  // --- Extracted: Info construction ---
  const newInfo = constructInfo(
    isFid,
    xData,
    dataClass,
    solvent,
    nmrSpectralWidth,
    frequencyOffset,
    baseFrequency,
    title,
    originFrequency,
    nucleus,
    nmrDataType,
    nmrOwner,
  );
  const info = { ...infoInput, ...newInfo };

  // --- Extracted: Header construction ---

  const header = constructHeader(info, meta);

  const nbPoints = xData.length;
  const spectralWidth = Math.abs(xData[nbPoints - 1] - xData[0]);
  const firstPoint = xData[0] > xData[1] ? spectralWidth : 0;
  const lastPoint = xData[0] > xData[1] ? 0 : spectralWidth;

  const symbol = ['X'];
  const varDim = [nbPoints];
  const units = [xVariable.units ?? (isFid ? 'Time' : 'Hz')];
  const varType = ['INDEPENDENT'];
  const varForm = ['AFFN'];
  const factor =
    'factor' in options
      ? { ...options.factor }
      : ({} as Record<OneLowerCase, number>);
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
    const { firstLast, minMax } = getExtremeValues(variable.data);
    factor[key] = getBestFactor(variable.data, {
      factor: factor[key],
      minMax,
    });

    const currentFactor = factor[key];
    factorArray.push(currentFactor || 1);
    symbol.push(variable.symbol || (key === 'r' ? 'R' : 'I'));
    varName.push(name || key);
    varDim.push(variable.data.length);
    varForm.push('ASDF');
    first.push(firstLast.first);
    last.push(firstLast.last);
    max.push(minMax.max);
    min.push(minMax.min);
    varType.push('DEPENDENT');
    units.push(variable.units ?? 'Arbitrary');
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
        nmrDataType,
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
  dataType = '',
) {
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

function constructMeta(
  xData: NumberArray,
  isFid: boolean,
  nmrSpectralWidth: number | undefined,
  baseFrequency: number,
  originFrequency: number,
  digitalFilter: number | undefined,
  decim: number | undefined,
  dspfvs: number | undefined,
  currentMeta: Record<string, any>,
  variables: NMR1DVariables,
) {
  const newMeta: any = {
    OFFSET: xData[0] / originFrequency,
  };
  maybeAdd(newMeta, 'SW', nmrSpectralWidth);
  maybeAdd(newMeta, 'BF1', baseFrequency);

  if (isFid) {
    maybeAdd(newMeta, 'GRPDLY', digitalFilter);
    maybeAdd(newMeta, 'DECIM', decim);
    maybeAdd(newMeta, 'REVERSE', 'no');
    maybeAdd(newMeta, 'DSPFVS', dspfvs);
  }
  maybeAdd(newMeta, 'SYMBOL', variables.i ? '' : currentMeta.SYMBOL);
  return newMeta;
}

function constructInfo(
  isFid: boolean,
  xData: NumberArray,
  dataClass: string,
  solvent: string | undefined,
  nmrSpectralWidth: number | undefined,
  frequencyOffset: number | undefined,
  baseFrequency: number | undefined,
  title: string | undefined,
  originFrequency: number,
  nucleus: string | undefined,
  nmrDataType: string | undefined,
  nmrOwner: string | undefined,
) {
  let shiftReference;
  if (frequencyOffset && baseFrequency) {
    const offset = frequencyOffset / baseFrequency;
    shiftReference = offset + 0.5 * (nmrSpectralWidth ?? 0);
  } else {
    shiftReference = xData[xData.length - 1];
  }

  const newInfo: Record<string, any> = {};
  maybeAdd(
    newInfo,
    '.SHIFT REFERENCE',
    `INTERNAL, ${String(solvent)}, ${isFid ? xData.length : 1}, ${shiftReference}`,
  );
  maybeAdd(newInfo, 'TITLE', title);
  maybeAdd(newInfo, '.OBSERVE FREQUENCY', originFrequency);
  maybeAdd(newInfo, '.OBSERVE NUCLEUS', getOneIfArray(nucleus));
  maybeAdd(newInfo, 'DATATYPE', nmrDataType);
  maybeAdd(newInfo, 'DATACLASS', dataClass);
  maybeAdd(newInfo, '.SOLVENT', solvent);
  maybeAdd(newInfo, 'OWNER', nmrOwner);

  return newInfo;
}

function applyScaling(
  variables: NMR1DVariables,
  scaleFactor: number | undefined,
  newMeta: Record<string, any>,
) {
  const scale = 1 / (scaleFactor ?? 1);
  if (scale !== 1) {
    maybeAdd(newMeta, 'NC_proc', -Math.log2(scale));
    xMultiply(variables.r?.data || [], scale, {
      output: variables.r?.data,
    });
    if (variables.i) {
      xMultiply(variables.i?.data || [], scale, {
        output: variables.i?.data,
      });
    }
  }
}

function constructHeader(info: Record<string, any>, meta: Record<string, any>) {
  const {
    TITLE = '',
    OWNER = '',
    ORIGIN = '',
    DATATYPE = '',
    DATACLASS,
    ...resInfo
  } = info;
  let header = `##TITLE=${TITLE}
##JCAMP-DX=6.00
##DATA TYPE= ${DATATYPE}
##DATA CLASS= ${DATACLASS}
##ORIGIN=${ORIGIN}
##OWNER=${OWNER}\n`;

  header += addInfoData(resInfo, { prefix: '##' });
  header += addInfoData(meta);
  return header;
}

function maybeAdd(
  obj: any,
  name: string,
  value?: string | number | boolean | string[] | number[] | boolean[],
) {
  if (typeof value === 'undefined') return;
  obj[name] = getOneIfArray(value);
}
