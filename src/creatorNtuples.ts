import maxFct from 'ml-array-max';
import minFct from 'ml-array-min';

/**
 * Parse from a xyxy data array
 * @param {Array<Array<number>>} variables
 * @param {object} [meta] - same metadata object format that the fromText
 * @return {string} JCAMP of the input
 */
export default function creatorNtuples(variables, options) {
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

  const keys = Object.keys(variables);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    let variable = variables[key];

    let name = variable.label && variable.label.replace(/ *\[.*/, '');
    let unit = variable.label && variable.label.replace(/.*\[(.*)\].*/, '$1');

    symbol.push(variable.symbol || key);
    varName.push(variable.name || name || key);
    varDim.push(variables[key].data.length);

    if (variable.isDependent !== undefined) {
      varType.push(variable.isDependent ? 'DEPENDENT' : 'INDEPENDENT');
    } else {
      varType.push(
        variable.type
          ? variable.type.toUpperCase()
          : i === 0
          ? 'INDEPENDENT'
          : 'DEPENDENT',
      );
    }

    units.push(variable.units || unit || '');
    first.push(variables[key][0]);
    last.push(variables[key][variables[key].length - 1]);
    min.push(minFct(variables[key].data));
    max.push(maxFct(variables[key].data));
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

  for (let i = 0; i < variables[keys[0]].data.length; i++) {
    let point = [];
    for (let key of keys) {
      point.push(variables[key].data[i]);
    }
    header += `${point.join('\t')}\n`;
  }

  header += '##END';
  return header;
}
