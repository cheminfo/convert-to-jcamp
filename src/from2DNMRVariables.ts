import type {
  DoubleArray,
  OneLowerCase,
  MeasurementXYVariables,
} from 'cheminfo-types';
import { isAnyArray } from 'is-any-array';
import { DoubleMatrix } from 'ml-spectra-processing';

import { JcampOptions } from './JcampOptions';
import { addInfoData } from './utils/addInfoData';
import { checkMatrix } from './utils/checkMatrix';
import { checkNumberOrArray } from './utils/checkNumberOrArray';
import { getBestFactor } from './utils/getBestFactor';
import { getBestFactorMatrix } from './utils/getBestFactorMatrix';
import { getExtremeValues } from './utils/getExtremeValues';
import { MinMax } from './utils/minMax';
import { rescaleAndEnsureInteger } from './utils/rescaleAndEnsureInteger';
import { vectorEncoder } from './utils/vectorEncoder';

export type NMR2DVariables = Required<
  Pick<MeasurementXYVariables, 'x' | 'y' | 'z'>
>;
/**
 * Create a jcamp of 2D NMR data by variables. Currently only the convertion of processed data
 * is supported. The variables x and y are the direct (F2 in Bruker) and indirect (F1 in bruker),
 * data should be in ppm scale, the z variable is the intensity (dependent)
 */
export function from2DNMRVariables(
  variables: NMR2DVariables,
  options: JcampOptions = {},
): string {
  const { info = {}, meta = {}, xyEncoding = 'DIFDUP' } = options;

  const factor =
    'factor' in options
      ? { ...options.factor }
      : ({} as Record<OneLowerCase, number>);

  const { title = '', owner = '', origin = '', dataType = 'NMR SPECTRUM' } = info;

  const symbol = [];
  const varName = [];
  const varType = [];
  const varDim = [];
  const units = [];
  const first = [];
  const last = [];
  const min = [];
  const max = [];
  const factors = [];

  const keys = ['y', 'x', 'z'] as Array<keyof NMR2DVariables>;

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    let variable = variables[key];
    if (!variable) throw new Error('variables x, y and z are mandatory');

    let name = variable?.label.replace(/ *\[.*/, '');
    let unit = variable?.label.replace(/.*\[(?<units>.*)\].*/, '$<units>');

    const { firstLast, minMax } = getExtremeValues(variable.data);
    if (!(key in factor)) factor[key] = calculateFactor(variable.data, minMax);

    symbol.push(variable.symbol || key);
    varName.push(name || key);
    varDim.push(variable.data.length);
    first.push(firstLast.first);
    last.push(firstLast.last);
    max.push(minMax.max);
    min.push(minMax.min);
    factors.push(factor[key]);

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

  let xData = variables.x.data;
  let yData = variables.y.data;
  checkNumberOrArray(xData);
  checkNumberOrArray(yData);
  checkMandatoryParameters(meta);

  const zData = variables.z?.data || [];
  checkMatrix(zData);

  const { direct, indirect, dependent } = getDimensionIndices(symbol);

  const nuc1 = String(meta.NUC1);
  const nuc2 = String(meta.NUC2);
  const nucleus = new Array(3);
  nucleus[direct] = nuc1;
  nucleus[indirect] = nuc2;

  const sfo1 = Number(meta.SFO1);
  const sfo2 = Number(meta.SFO2);
  const optionsScaleAndJoin = {
    indices: { direct, indirect },
    sfo1,
    sfo2,
  };

  header += `##NTUPLES= ${dataType}
##VAR_NAME=  ${varName.join()}
##SYMBOL=    ${symbol.join()}
##VAR_TYPE=  ${varType.join()}
##VAR_DIM=   ${varDim.join()}
##.NUCLEUS=  ${nucleus.join()}
##UNITS=     ${units.join()}
##FACTOR=    ${factors.join()}
##FIRST=     ${scaleAndJoin(first, optionsScaleAndJoin)}
##LAST=      ${scaleAndJoin(last, optionsScaleAndJoin)}
##MIN=       ${scaleAndJoin(min, optionsScaleAndJoin)}
##MAX=       ${scaleAndJoin(max, optionsScaleAndJoin)}\n`;
  header += `##VAR_FORM= AFFN, AFFN, ASDF\n`;
  header += '##NUM DIM= 2\n';

  if (keys[direct] !== 'x') {
    [yData, xData] = [xData, yData];
  }
  const directSymbol = symbol[direct].toUpperCase();
  const indirectSymbol = symbol[indirect].toUpperCase();

  const firstY = yData[0] * sfo2;
  const lastY = yData[yData.length - 1] * sfo2;
  const firstX = xData[0];
  const lastX = xData[xData.length - 1];
  const deltaX = (lastX - firstX) / (xData.length - 1);
  const deltaY = (lastY - firstY) / (yData.length - 1);

  let firstData = new Float64Array(3);
  firstData[direct] = firstX * sfo1;
  firstData[indirect] = firstY;

  const yFactor = factor.y || 1;
  const xFactor = factor.x || 1;
  const zFactor = factor.z || 1;

  for (let index = 0; index < zData.length; index++) {
    firstData[dependent] = zData[index][0];
    header += `##PAGE= ${indirectSymbol}=${
      (firstY + deltaY * index) / yFactor
    }\n`;
    header += `##FIRST=  ${firstData.join()}\n`;
    header += `##DATA TABLE= (${directSymbol}++(Y..Y)), PROFILE\n`;
    header += vectorEncoder(
      rescaleAndEnsureInteger(zData[index], zFactor),
      firstX / xFactor,
      deltaX / xFactor,
      xyEncoding,
    );
    header += '\n';
  }

  return header;
}

function scaleAndJoin(
  variable: number[],
  options: {
    indices: { direct: number; indirect: number };
    sfo1: number;
    sfo2: number;
  },
) {
  const { sfo1, sfo2 } = options;
  const { direct, indirect } = options.indices;
  const copy = variable.slice();
  copy[direct] *= sfo1;
  copy[indirect] *= sfo2;
  return copy.join();
}

function getDimensionIndices(entry: string[]) {
  const symbol = entry.map((e) => e.toUpperCase());
  const direct = symbol.includes('F2')
    ? symbol.indexOf('F2')
    : symbol.indexOf('T2');
  const indirect = symbol.includes('F1')
    ? symbol.indexOf('F1')
    : symbol.indexOf('T1');
  if (direct === -1 || indirect === -1) {
    throw new Error(
      'F2/T2 and F1/T1 symbol should be defined for nD NMR SPECTRUM',
    );
  }
  return { direct, indirect, dependent: 3 - direct - indirect };
}

function checkMandatoryParameters(meta: Record<string, any>) {
  const list = ['SFO1', 'SFO2', 'NUC1', 'NUC2'];

  for (const key of list) {
    if (!meta[key]) {
      throw new Error(`${key} in options.meta should be defined`);
    }
  }
}

function calculateFactor(data: DoubleArray | DoubleMatrix, minMax: MinMax) {
  return isAnyArray(data[0])
    ? getBestFactorMatrix(data as DoubleMatrix, { minMax })
    : getBestFactor(data as DoubleArray, { minMax });
}
