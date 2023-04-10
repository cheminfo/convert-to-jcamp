import { getCoffee } from 'bruker-data-test';
import { convertFileList } from 'brukerconverter';
import { MeasurementXYVariables } from 'cheminfo-types';
import { convert } from 'jcampconverter';
import { xMultiply } from 'ml-spectra-processing';

import { JcampOptions } from '..';
import { from1DNMRVariables } from '../from1DNMRVariables';

const converterOptions = {
  converter: { xy: true },
  filter: {
    onlyFirstProcessedData: true,
    ignoreFID: true,
    ignore2D: true,
  },
};

describe('convert bruker to jcamp', () => {
  it('FFT bruker expno', async () => {
    const fileList = getCoffee();
    const oneExpno = fileList.filter((file) =>
      file.webkitRelativePath.includes(
        'UV1009_M1-1003-1002_6268712_73uEjPg4XR/20',
      ),
    );
    const spectra = await convertFileList(oneExpno, converterOptions);
    const jcamp = getJcamp(spectra[0]) || '';
    const converted = convert(jcamp, { keepRecordsRegExp: /^\$.*/ }).flatten[0];

    expect(converted.meta).toStrictEqual(spectra[0].meta);
  });
});

function getJcamp(spectrum: any) {
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
    } as JcampOptions;

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
    } as MeasurementXYVariables;

    return from1DNMRVariables(variables, options);
  }
}
