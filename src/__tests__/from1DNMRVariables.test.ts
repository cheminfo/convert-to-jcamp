import { getCoffee } from 'bruker-data-test';
import { convertFileCollection } from 'brukerconverter';
import { MeasurementXYVariables } from 'cheminfo-types';
import { convert } from 'jcampconverter';
import { toMatchCloseTo } from 'jest-matcher-deep-close-to';
import { rangesToXY, xyAutoPeaksPicking } from 'nmr-processing';
import { describe, it, expect } from 'vitest';
import { from1DNMRVariables, NmrJcampOptions } from '../from1DNMRVariables';

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
    expect(converted.spectra[0].data.x[0]).toBeCloseTo(
      spectrum[0].spectra[0].data.x[0],
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

describe('generate a jcamp from simulated spectrum', () => {
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
      i: {
        data: xy.y,
        label: 'Imaginary data',
      },
    };

    const jcamp = from1DNMRVariables(data, {
      xyEncoding: 'DIFDUP',
      nmrInfo: {
        isFid: false,
        nucleus: '1H',
        dataType: 'NMR SPECTRUM',
        originFrequency: frequency,
        baseFrequency: frequency - 0.001,
        dataClass: 'NTUPLES',
      },
    });

    const converted = convert(jcamp, { keepRecordsRegExp: /^\$.*/ }).flatten[0];
    const newPeaks = xyAutoPeaksPicking(converted.spectra[0].data, {
      frequency,
    });
    expect(newPeaks).toHaveLength(3);
    expect(newPeaks[1].x).toBeCloseTo(2, 1);
    expect(newPeaks[1].y).toBeCloseTo(peaks[1].y, 2);
  });
});

describe('from1DNMRVariables edge and error cases', () => {
  it('throws if originFrequency is missing', () => {
    const data = {
      x: { data: [1, 2, 3], label: 'x' },
      r: { data: [4, 5, 6], label: 'r' },
    };
    expect(() =>
      from1DNMRVariables(data, {
        nmrInfo: {
          isFid: false,
          nucleus: '1H',
          dataType: 'NMR SPECTRUM',
          // originFrequency missing
        },
      } as any),
    ).toThrow(/originFrequency is mandatory/);
  });

  it('handles isFid true (FID data)', () => {
    const data = {
      x: { data: [0, 1, 2], label: 'Time', units: 's' },
      r: { data: [10, 20, 30], label: 'FID real' },
      i: { data: [5, 15, 25], label: 'FID imag' },
    };
    const jcamp = from1DNMRVariables(data, {
      nmrInfo: {
        isFid: true,
        originFrequency: 400,
        nucleus: '1H',
        dataType: 'NMR FID',
        dataClass: 'NTUPLES',
        decim: 2,
        dspfvs: 10,
        digitalFilter: 1,
      },
    });
    expect(jcamp).toContain('##$GRPDLY=1');
    expect(jcamp).toContain('##$DECIM=2');
    expect(jcamp).toContain('##$DSPFVS=10');
    expect(jcamp).toContain('##DATA TYPE= NMR FID');
  });

  it('handles only x and r (no i)', () => {
    const data = {
      x: { data: [1, 2, 3], label: 'x', units: 'Hz' },
      r: { data: [4, 5, 6], label: 'r', units: 'a.u.' },
    };
    const jcamp = from1DNMRVariables(data, {
      nmrInfo: {
        isFid: false,
        originFrequency: 500,
        nucleus: '1H',
        dataType: 'NMR SPECTRUM',
        dataClass: 'XYDATA',
      },
    });
    expect(jcamp).toContain('##DATA CLASS= XYDATA');
    expect(jcamp).toContain('##XYDATA=');
    expect(jcamp).not.toContain('##DATA TABLE=');
  });

  it('applies custom scaleFactor', () => {
    const data = {
      x: { data: [1, 2, 3], label: 'x' },
      r: { data: [10, 20, 30], label: 'r' },
      i: { data: [5, 15, 25], label: 'i' },
    };
    const jcamp = from1DNMRVariables(data, {
      nmrInfo: {
        isFid: false,
        originFrequency: 400,
        nucleus: '1H',
        dataType: 'NMR SPECTRUM',
        dataClass: 'NTUPLES',
        scaleFactor: 2,
      },
    });
    expect(jcamp).toContain('NC_proc');
  });

  it('applies custom factor in options', () => {
    const data = {
      x: { data: [1, 2, 3], label: 'x' },
      r: { data: [10, 20, 30], label: 'r' },
      i: { data: [5, 15, 25], label: 'i' },
    };
    const jcamp = from1DNMRVariables(data, {
      nmrInfo: {
        isFid: false,
        originFrequency: 400,
        nucleus: '1H',
        dataType: 'NMR SPECTRUM',
        dataClass: 'NTUPLES',
      },
      factor: { r: 100, i: 100 } as any, // Cast to any to satisfy type
    });
    expect(jcamp).toContain('##FACTOR=');
  });

  it('throws if r is missing in real/imaginary data', () => {
    const data = {
      x: { data: [1, 2, 3], label: 'x' },
      i: { data: [4, 5, 6], label: 'i' },
    };
    expect(() =>
      from1DNMRVariables(data as any, {
        nmrInfo: {
          isFid: false,
          originFrequency: 400,
          nucleus: '1H',
          dataType: 'NMR SPECTRUM',
          dataClass: 'NTUPLES',
        },
      }),
    ).toThrow(/variable r is mandatory/);
  });
});

function getJcamp(spectrum: any, selection = 'complex') {
  const { source } = spectrum;
  if (source.is1D && !source.isFID) {
    const { info, meta, spectra } = spectrum;
    const { observeFrequency, nucleus, data } = spectra[0];
    const options = {
      xyEncoding: 'DIFDUP',
      nmrInfo: {
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
    } as NmrJcampOptions;

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
