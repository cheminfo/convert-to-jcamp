import { groupByExperiments, convertFileList } from 'brukerconverter';
import { getCoffee } from 'bruker-data-test';
import { join } from 'path';
import { writeFileSync } from 'fs';
import { fromVariables } from 'convert-to-jcamp';
import { xMultiply } from 'ml-spectra-processing';

const pathToWrite = join(__dirname, 'jcampGenerated');
const converterOptions = {
  converter: { xy: true },
  filter: {
    // experimentNumber: [120, 121, 122],
    onlyFirstProcessedData: true,
    ignoreFID: true,
    ignore2D: true,
  },
};

(async () => {
  const brukerFileList = getCoffee(); //Or you can generate a fileList of a bruker folder using `filelist-utils`
  const spectra = await convertFileList(brukerFileList, converterOptions);
  writeJcamps(spectra);
})();

// If the folder is soo big, you can process expno by expno like:
/*
(async () => {
  const fileList = fileListFromPath('pathToData');
  const experiments = groupByExperiments(fileList, converterOptions.filter);
  for (const expno of experiments) {
    const spectra = await convertFileList(expno.fileList, converterOptions);
    writeJcamps(spectra);
  }
})()
*/

function writeJcamps(spectra) {
  for (const spectrum of spectra) {
    const { source } = spectrum;
    if (source.is1D && !source.isFID) {
      const { info, meta, spectra } = spectrum;
      const { observeFrequency, nucleus, data } = spectra[0];
      const options = {
        xyEncoding: 'DIFDUP',
        info: {
          title: info.TITLE,
          owner: info.OWNER,
          origin: info.ORIGIN,
          dataType: meta.DATATYPE,
          '.OBSERVE FREQUENCY': observeFrequency,
          '.OBSERVE NUCLEUS': nucleus[0],
        },
        meta,
        isXYData: true,
        isNMR: true,
      };

      // the order of variables in the object is important
      const variables = {
        x: {
          data: xMultiply(data.x, observeFrequency),
          label: 'Frequencies',
          units: 'Hz',
          symbol: 'X',
          isDependent: false,
        },
        r: {
          data: data.re,
          label: 'real data',
          units: 'arbitratry units',
          symbol: 'R',
          isDependent: true,
        },
        i: {
          data: data.im,
          label: 'imaginary data',
          units: 'arbitratry units',
          symbol: 'I',
          isDependent: true,
        },
      };

      const jcamp = fromVariables(variables, options);
      writeFileSync(
        join(pathToWrite, `${source.name}_${source.expno}.jdx`),
        jcamp,
      );
    }
  }
}
