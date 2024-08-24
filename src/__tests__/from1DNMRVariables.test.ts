import { writeFileSync } from 'fs';

import { getCoffee } from 'bruker-data-test';
import { convertFileCollection } from 'brukerconverter';
import { MeasurementXYVariables } from 'cheminfo-types';
import { convert } from 'jcampconverter';
import { toMatchCloseTo } from 'jest-matcher-deep-close-to';
import { rangesToXY, xyAutoPeaksPicking } from 'nmr-processing';

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

expect.extend({ toMatchCloseTo });

describe('convert bruker to jcamp', () => {
  it('FFT bruker expno', async () => {
    const fileCollection = await getCoffee();
    const oneExpno = fileCollection.filter((file) =>
      file.relativePath.includes('UV1009_M1-1003-1002_6268712_73uEjPg4XR/20'),
    );
    const spectra = await convertFileCollection(oneExpno, converterOptions);
    const spectrum = spectra.filter((spectrum) => {
      const {
        // @ts-expect-error is1D is not defined on 2D but this is a test case
        source: { is1D, isFID },
      } = spectrum;
      return is1D && !isFID;
    });
    const jcamp = getJcamp(spectrum[0]) || '';
    const converted = convert(jcamp, { keepRecordsRegExp: /^\$.*/ }).flatten[0];
    expect(converted.meta).toMatchCloseTo(spectrum[0].meta, 5);
    expect(converted.spectra[0].data.y[0]).toBeCloseTo(
      spectrum[0].spectra[0].data.re[0],
      3,
    );
    expect(converted.spectra).toHaveLength(2);
  });
  it('FFT bruker expno only real', async () => {
    const fileCollection = await getCoffee();
    const oneExpno = fileCollection.filter((file) =>
      file.relativePath.includes('UV1009_M1-1003-1002_6268712_73uEjPg4XR/20'),
    );
    const spectra = await convertFileCollection(oneExpno, converterOptions);
    const spectrum = spectra.filter((spectrum) => {
      const {
        // @ts-expect-error is1D is not defined on 2D but this is a test case
        source: { is1D, isFID },
      } = spectrum;
      return is1D && !isFID;
    });
    const jcamp = getJcamp(spectrum[0], 'real') || '';
    const converted = convert(jcamp, { keepRecordsRegExp: /^\$.*/ }).flatten[0];

    expect(converted.meta).toMatchCloseTo(spectrum[0].meta, 5);
    expect(converted.spectra[0].data.x[0]).toBeCloseTo(
      spectrum[0].spectra[0].data.x[0],
      3,
    );
    expect(converted.spectra[0].data.y[0]).toBeCloseTo(
      spectrum[0].spectra[0].data.re[0],
      3,
    );
    expect(converted.spectra).toHaveLength(1);
  });
  it('FFT bruker expno only real without customInfo', async () => {
    const fileCollection = await getCoffee();
    const oneExpno = fileCollection.filter((file) =>
      file.relativePath.includes('UV1009_M1-1003-1002_6268712_73uEjPg4XR/20'),
    );
    const spectra = await convertFileCollection(oneExpno, converterOptions);
    const spectrum = spectra.filter((spectrum) => {
      const {
        // @ts-expect-error is1D is not defined on 2D but this is a test case
        source: { is1D, isFID },
      } = spectrum;
      return is1D && !isFID;
    });
    spectrum[0].meta = {
      OFFSET: spectrum[0].spectra[0].data.x[0],
    };
    const jcamp = getJcamp(spectrum[0], 'real') || '';
    const matchResult = jcamp
      .slice(400, 1000)
      .match(/##DELTAX=(?<delta>[+-]?\d+(\.\d+)?)\s*.*/);
    const deltaXInJcamp = matchResult?.groups?.delta;
    const converted = convert(jcamp, { keepRecordsRegExp: /^\$.*/ }).flatten[0];
    const { lastX, firstX, deltaX } = converted.spectra[0];
    expect(Number(deltaXInJcamp) < 0).toBe(lastX - firstX < 0);
    expect(lastX - firstX < 0).toBe(deltaX < 0);
    expect(converted.spectra[0].data.x[0]).toBeCloseTo(
      spectrum[0].spectra[0].data.x[0],
      3,
    );
    expect(converted.spectra[0].data.y[0]).toBeCloseTo(
      spectrum[0].spectra[0].data.re[0],
      3,
    );
    expect(converted.spectra).toHaveLength(1);
  });
});

describe.only('generate a jcamp from simulated spectrum', () => {
  it('from signals to xy', async () => {
    const frequency = 600;
    const signals = [
      {
        atoms: [1],
        nbAtoms: 1,
        delta: 2,
        js: [{ coupling: 7.758, multiplicity: 't' }],
      },
    ];

    const xy = rangesToXY([{ from: 0.5, to: 2.5, signals }], { frequency });
    const peaks = xyAutoPeaksPicking(xy, { frequency });
    expect(peaks).toHaveLength(3);
    expect(peaks[1].x).toBeCloseTo(2, 1);
    const data = {
      x: {
        data: xy.x,
        frequency,
        label: 'Chemical Shift (ppm)',
      },
      r: {
        data: xy.y,
        label: 'Real data',
      },
    };
    const jcamp = from1DNMRVariables(data, {
      xyEncoding: 'DIFDUP',
      info: {
        nucleus: '1H',
        title: '1H NMR',
        dataType: 'NMR Spectrum',
        '.OBSERVE FREQUENCY': frequency,
      },
    });

    const converted = convert(jcamp, { keepRecordsRegExp: /^\$.*/ }).flatten[0];
    writeFileSync('jcamp.dx', jcamp);
    const newPeaks = xyAutoPeaksPicking(converted.spectra[0].data, {
      frequency,
    });
    expect(newPeaks).toHaveLength(3);
    // expect(newPeaks[1].x).toBeCloseTo(2, 1);
    expect(newPeaks[1].y).toBeCloseTo(peaks[1].y, 2);
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
        isFid: info.isFid,
        title: info.TITLE,
        owner: info.OWNER,
        origin: info.ORIGIN,
        dataType: meta.DATATYPE,
        dataClass: meta.DATACLASS,
        NPOINTS: data.x.length,
        originFrequency: observeFrequency,
        nucleus: nucleus[0],
      },
      meta,
    } as JcampOptions;

    // the order of variables in the object is important
    const variables = {
      x: {
        data: data.x,
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
