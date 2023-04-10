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

const { parse, stringify } = JSON;

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
    const converted = parse(
      stringify(convert(jcamp, { keepRecordsRegExp: /^\$.*/ })),
    ).flatten[0];

    expect(converted.meta).toStrictEqual(spectra[0].meta);
    expect(converted.spectra[0].data.x[0]).toBeCloseTo(
      spectra[0].spectra[0].data.x[0],
      3,
    );
    expect(converted.spectra).toHaveLength(2);
  });
  it('FFT bruker expno only real', async () => {
    const fileList = getCoffee();
    const oneExpno = fileList.filter((file) =>
      file.webkitRelativePath.includes(
        'UV1009_M1-1003-1002_6268712_73uEjPg4XR/20',
      ),
    );
    const spectra = await convertFileList(oneExpno, converterOptions);
    const jcamp = getJcamp(spectra[0], 'real') || '';
    const converted = parse(
      stringify(convert(jcamp, { keepRecordsRegExp: /^\$.*/ })),
    ).flatten[0];

    expect(converted.meta).toStrictEqual(spectra[0].meta);
    expect(converted.spectra[0].data.x[0]).toBeCloseTo(
      spectra[0].spectra[0].data.x[0],
      3,
    );
    expect(converted.spectra).toHaveLength(1);
  });
});

function getJcamp(spectrum: any, selection = 'complex') {
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
    } as MeasurementXYVariables;

    if (selection === 'complex') {
      variables.i = {
        data: data.im,
        label: 'imaginary data',
        units: 'arbitratry units',
        symbol: 'I',
        isDependent: true,
      };
    }

    return from1DNMRVariables(variables, options);
  }
}
