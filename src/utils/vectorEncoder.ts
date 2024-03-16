import { NumberArray } from 'cheminfo-types';

/**
 * class encodes a integer vector as a String in order to store it in a text file.
 * The algorithms used to encode the data are describe in:
 *            http://www.iupac.org/publications/pac/pdf/2001/pdf/7311x1765.pdf
 */
const newLine = '\n';

const pseudoDigits: string[][] = [
  ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
  ['@', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'],
  ['@', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i'],
  ['%', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R'],
  ['%', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r'],
  [' ', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 's'],
];

const SQZ_P = 1;
const SQZ_N = 2;
const DIF_P = 3;
const DIF_N = 4;
const DUP = 5;
const maxLinelength = 100;

/**
 * This function encodes the given vector. The xyEncoding format is specified by the
 * xyEncoding option
 * @param xyEncoding: ('FIX','SQZ','DIF','DIFDUP','CVS','PAC') Default 'DIFDUP'
 * @return {string}
 */
export function vectorEncoder(
  data: NumberArray,
  firstX: number,
  intervalX: number,
  xyEncoding?: string,
) {
  switch (xyEncoding) {
    case 'FIX':
      return fixEncoding(data, firstX, intervalX);
    case 'SQZ':
      return squeezedEncoding(data, firstX, intervalX);
    case 'DIF':
      return differenceEncoding(data, firstX, intervalX);
    case 'DIFDUP':
      return differenceDuplicateEncoding(data, firstX, intervalX);
    case 'CSV':
      return commaSeparatedValuesEncoding(data, firstX, intervalX);
    case 'PAC':
      return packedEncoding(data, firstX, intervalX);
    default:
      return differenceEncoding(data, firstX, intervalX);
  }
}

/**
 * @private
 * No data compression used. The data is separated by a comma(',').
 */
export function commaSeparatedValuesEncoding(
  data: NumberArray,
  firstX: number,
  intervalX: number,
) {
  return fixEncoding(data, firstX, intervalX, ',');
}

/**
 * @private
 * No data compression used. The data is separated by the specified separator.
 */
export function fixEncoding(
  data: NumberArray,
  firstX: number,
  intervalX: number,
  separator = ' ',
) {
  let outputData = '';
  let j = 0;
  const dataLength = data.length;
  while (j < dataLength - 7) {
    outputData += Math.ceil(firstX + j * intervalX);
    for (let i = 0; i < 8; i++) {
      outputData += `${separator}${data[j++]}`;
    }
    outputData += newLine;
  }
  if (j < dataLength) {
    // We add last numbers
    outputData += Math.ceil(firstX + j * intervalX);
    for (let i = j; i < dataLength; i++) {
      outputData += `${separator}${data[i]}`;
    }
  }
  return outputData;
}

/**
 * @private
 * No data compression used. The data is separated by the sign of the number.
 */
export function packedEncoding(
  data: NumberArray,
  firstX: number,
  intervalX: number,
) {
  let outputData = '';
  let j = 0;
  const dataLength = data.length;

  while (j < dataLength - 7) {
    outputData += Math.ceil(firstX + j * intervalX);
    for (let i = 0; i < 8; i++) {
      outputData += data[j] < 0 ? data[j++] : `+${data[j++]}`;
    }
    outputData += newLine;
  }
  if (j < dataLength) {
    // We add last numbers
    outputData += Math.ceil(firstX + j * intervalX);
    for (let i = j; i < dataLength; i++) {
      outputData += data[i] < 0 ? data[i] : `+${data[i]}`;
    }
  }
  return outputData;
}

/**
 * @private
 * Data compression is possible using the squeezed form (SQZ) in which the delimiter, the leading digit,
 * and sign are replaced by a pseudo-digit from Table 1. For example, the Y-values 30, 32 would be
 * represented as C0C2.
 */
export function squeezedEncoding(
  data: NumberArray,
  firstX: number,
  intervalX: number,
) {
  let outputData = '';
  // String outputData = new String();
  let j = 0;
  const dataLength = data.length;
  while (j < dataLength - 10) {
    outputData += Math.ceil(firstX + j * intervalX);
    for (let i = 0; i < 10; i++) {
      outputData += squeezedDigit(data[j++].toString());
    }
    outputData += newLine;
  }
  if (j < dataLength) {
    // We add last numbers
    outputData += Math.ceil(firstX + j * intervalX);
    for (let i = j; i < dataLength; i++) {
      outputData += squeezedDigit(data[i].toString());
    }
  }

  return outputData;
}

/**
 * @private
 * Duplicate suppression xyEncoding
 */
export function differenceDuplicateEncoding(
  data: NumberArray,
  firstX: number,
  intervalX: number,
) {
  let mult = 0;
  let index = 0;
  let charCount = 0;
  // We built a string where we store the encoded data.
  let encodedData = '';
  let encodedNumber = '';
  let temp = '';

  // We calculate the differences vector
  const diffData = new Array(data.length - 1);
  for (let i = 0; i < diffData.length; i++) {
    diffData[i] = data[i + 1] - data[i];
  }

  // We simulate a line carry
  const numDiff = diffData.length;
  while (index < numDiff) {
    if (charCount === 0) {
      // Start line
      encodedNumber = `${Math.ceil(firstX + index * intervalX)}${squeezedDigit(
        data[index].toString(),
      )}${differenceDigit(diffData[index].toString())}`;
      encodedData += encodedNumber;
      charCount += encodedNumber.length;
    } else if (diffData[index - 1] === diffData[index]) {
      // Try to insert next difference
      mult++;
    } else if (mult > 0) {
      // Now we know that it can be in line
      mult++;
      encodedNumber = duplicateDigit(mult.toString());
      encodedData += encodedNumber;
      charCount += encodedNumber.length;
      mult = 0;
      index--;
    } else {
      // Check if it fits, otherwise start a new line
      encodedNumber = differenceDigit(diffData[index].toString());
      if (encodedNumber.length + charCount < maxLinelength) {
        encodedData += encodedNumber;
        charCount += encodedNumber.length;
      } else {
        // start a new line
        encodedData += newLine;
        temp = `${Math.ceil(firstX + index * intervalX)}${squeezedDigit(
          data[index].toString(),
        )}${encodedNumber}`;
        encodedData += temp; // Each line start with first index number.
        charCount = temp.length;
      }
    }
    index++;
  }
  if (mult > 0) {
    encodedData += duplicateDigit((mult + 1).toString());
  }
  // We insert the last data from fid. It is done to control of data
  // The last line start with the number of datas in the fid.
  encodedData += `${newLine}${Math.ceil(
    firstX + index * intervalX,
  )}${squeezedDigit(data[index].toString())}`;

  return encodedData;
}

/**
 * @private
 * Differential xyEncoding
 */
export function differenceEncoding(
  data: NumberArray,
  firstX: number,
  intervalX: number,
) {
  let index = 0;
  let charCount = 0;
  let i;

  let encodedData = '';
  let encodedNumber = '';
  let temp = '';

  // We calculate the differences vector
  const diffData = new Array(data.length - 1);
  for (i = 0; i < diffData.length; i++) {
    diffData[i] = data[i + 1] - data[i];
  }

  const numDiff = diffData.length;
  while (index < numDiff) {
    if (charCount === 0) {
      // We convert the first number.
      encodedNumber = `${Math.ceil(firstX + index * intervalX)}${squeezedDigit(
        data[index].toString(),
      )}${differenceDigit(diffData[index].toString())}`;
      encodedData += encodedNumber;
      charCount += encodedNumber.length;
    } else {
      encodedNumber = differenceDigit(diffData[index].toString());
      if (encodedNumber.length + charCount < maxLinelength) {
        encodedData += encodedNumber;
        charCount += encodedNumber.length;
      } else {
        encodedData += newLine;
        temp = `${Math.ceil(firstX + index * intervalX)}${squeezedDigit(
          data[index].toString(),
        )}${encodedNumber}`;
        encodedData += temp; // Each line start with first index number.
        charCount = temp.length;
      }
    }
    index++;
  }
  // We insert the last number from data. It is done to control of data
  encodedData += `${newLine}${Math.ceil(
    firstX + index * intervalX,
  )}${squeezedDigit(data[index].toString())}`;

  return encodedData;
}

/**
 * @private
 * Convert number to the ZQZ format, using pseudo digits.
 */
function squeezedDigit(num: string) {
  let sqzDigits = '';
  if (num.startsWith('-')) {
    sqzDigits += pseudoDigits[SQZ_N][num.charCodeAt(1) - 48];
    if (num.length > 2) {
      sqzDigits += num.substring(2);
    }
  } else {
    sqzDigits += pseudoDigits[SQZ_P][num.charCodeAt(0) - 48];
    if (num.length > 1) {
      sqzDigits += num.substring(1);
    }
  }

  return sqzDigits;
}

/**
 * Convert number to the DIF format, using pseudo digits.
 */
function differenceDigit(num: string) {
  let diffDigits = '';

  if (num.startsWith('-')) {
    diffDigits += pseudoDigits[DIF_N][num.charCodeAt(1) - 48];
    if (num.length > 2) {
      diffDigits += num.substring(2);
    }
  } else {
    diffDigits += pseudoDigits[DIF_P][num.charCodeAt(0) - 48];
    if (num.length > 1) {
      diffDigits += num.substring(1);
    }
  }

  return diffDigits;
}

/**
 * Convert number to the DUP format, using pseudo digits.
 */
function duplicateDigit(num: string) {
  let dupDigits = '';
  dupDigits += pseudoDigits[DUP][num.charCodeAt(0) - 48];
  if (num.length > 1) {
    dupDigits += num.substring(1);
  }

  return dupDigits;
}
