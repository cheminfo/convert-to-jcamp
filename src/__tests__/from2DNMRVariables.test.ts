import { convert } from 'jcampconverter';
import { describe, it, expect } from 'vitest';
import { from2DNMRVariables } from '..';

describe('from2DNMRVariables', () => {
  it('from Z matrix', () => {
    const variables = {
      y: {
        data: [1, 2],
        symbol: 'F1',
        label: 'y',
        units: 'Hz a',
        isDependent: false,
      },
      x: {
        data: [0, 1, 2, 3, 4],
        symbol: 'F2',
        label: 'x',
        units: 'Hz',
        isDependent: false,
      },
      z: {
        data: [
          [2, 3, 4, 5, 7],
          [1, 2, 3, 4, 5],
        ],
        symbol: 'Y',
        label: 'z',
        units: 'arbitrary',
        isDependent: true,
      },
    };
    //@ts-expect-error ignoring some types
    const jcamp = from2DNMRVariables(variables, {
      xyEncoding: 'DIFDUP',
      meta: { SFO2: 100, SFO1: 400, NUC1: '1H', NUC2: '13C' },
      info: {
        '.OBSERVE NUCLEUS': '1H',
        '.OBSERVER FREQUENCY': 400,
      },
      nmrInfo: {
        dataType: 'nD NMR SPECTRUM',
      },
    });

    const converted = convert(jcamp, {
      keepRecordsRegExp: /^\$.*/,
      withoutXY: false,
      noContour: true,
    });
    const flatData: any = converted.flatten[0];
    expect(flatData.minMax.minX).toBeCloseTo(0, 1);
    expect(flatData.minMax.maxX).toBeCloseTo(4, 1);
    expect(flatData.minMax.minY).toBeCloseTo(1, 1);
    expect(flatData.minMax.maxY).toBeCloseTo(2, 1);
    expect(flatData.minMax.z).toStrictEqual([
      [2, 3, 4, 5, 7],
      [1, 2, 3, 4, 5],
    ]);
  });
});
