import maxFct from 'ml-array-max';
import minFct from 'ml-array-min';
import JcampOptions  from "./JcampOptions";
import {OneLowerCase, SpectrumVariables, SpectrumVariable} from 'cheminfo-types';

/**
 * Parse from a xyxy data array
 * @param {Array<Array<number>>} variables
 * @param {object} [meta] - same metadata object format that the fromText
 * @return {string} JCAMP of the input
 */
export default function creatorNtuples(variables:SpectrumVariables, options:JcampOptions) : string{
  const { meta = {}, info = {} } = options;

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
  const factor = [];

  const keys = Object.keys(variables) as OneLowerCase[];
  
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    let variable = variables[key] as SpectrumVariable;

    let name = variable.label && variable.label.replace(/ *\[.*/, '');
    let unit = variable.label && variable.label.replace(/.*\[(.*)\].*/, '$1');

    symbol.push(variable.symbol || key);
    varName.push(name || key);
    varDim.push(variable.data.length);

    if (variable.isDependent !== undefined) {
      varType.push(variable.isDependent ? 'DEPENDENT' : 'INDEPENDENT');
    } else {
      varType.push(
        variable.isDependent!==undefined
          ? ! variable.isDependent
          : i === 0
          ? 'INDEPENDENT'
          : 'DEPENDENT',
      );
    }

    units.push(variable.units || unit || '');
    first.push(variable.data[0]);
    last.push(variable.data[variable.data.length - 1]);
    min.push(minFct(variable.data));
    max.push(maxFct(variable.data));
    factor.push(1);
  }

  let header = `##TITLE=${title}
##JCAMP-DX=6.00
##DATA TYPE=${dataType}
##ORIGIN=${origin}
##OWNER=${owner}\n`;

  for (const key in meta) {
    header +=
      typeof meta[key] === 'object'
        ? `##$${key}=${JSON.stringify(meta[key])}\n`
        : `##$${key}=${meta[key]}\n`;
  }

  header += `##NTUPLES= ${dataType}
##VAR_NAME=  ${varName.join()}
##SYMBOL=    ${symbol.join()}
##VAR_TYPE=  ${varType.join()}
##VAR_DIM=   ${varDim.join()}
##UNITS=     ${units.join()}
##PAGE= N=1\n`;

  header += `##DATA TABLE= (${symbol.join('')}..${symbol.join('')}), PEAKS\n`;

  for (let i = 0; i < variables.x.data.length; i++) {
    let point = [];
    for (let key of keys) {
let variable = variables[key] as SpectrumVariable;
      point.push(variable.data[i]);
    }
    header += `${point.join('\t')}\n`;
  }

  header += '##END';
  return header;
}
