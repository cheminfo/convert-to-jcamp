import { MeasurementXYVariables } from 'cheminfo-types';
import { convert } from 'jcampconverter';

import { fromVariables } from '..';

describe('fromVariables', () => {
  it('3 variables', () => {
    const variables: MeasurementXYVariables = {
      x: { data: [1, 2, 3, 4], symbol: 'X', label: 'x value', units: 'x unit' },
      y: { data: [2, 3, 4, 5], symbol: 'Y', label: 'y value', units: 'y unit' },
      z: { data: [3, 4, 5, 6], symbol: 'T', label: 't value', units: 't unit' },
    };

    const jcamp = fromVariables(variables, {
      meta: {
        meta1: 'value1',
        meta2: 'value2',
      },
      info: {
        title: 'Hello world',
        dataType: 'TEST',
      },
    });

    const converted = convert(jcamp, { keepRecordsRegExp: /^\$.*/ }).flatten[0];

    expect(converted.meta).toStrictEqual({ meta1: 'value1', meta2: 'value2' });

    expect(converted.spectra[0].data).toStrictEqual({
      x: [1, 2, 3, 4],
      y: [2, 3, 4, 5],
      t: [3, 4, 5, 6],
    });

    expect(converted.spectra[0].variables).toStrictEqual({
      x: {
        name: 'x value',
        symbol: 'X',
        type: 'INDEPENDENT',
        dim: 4,
        first: 1,
        last: 4,
        max: 4,
        min: 1,
        units: 'x unit',
        data: [1, 2, 3, 4],
      },
      y: {
        name: 'y value',
        symbol: 'Y',
        type: 'DEPENDENT',
        dim: 4,
        first: 2,
        last: 5,
        max: 5,
        min: 2,
        units: 'y unit',
        data: [2, 3, 4, 5],
      },
      t: {
        name: 't value',
        symbol: 'T',
        type: 'DEPENDENT',
        dim: 4,
        first: 3,
        last: 6,
        max: 6,
        min: 3,
        units: 't unit',
        data: [3, 4, 5, 6],
      },
    });
  });

  it('3 variables with isDependent', () => {
    const variables: MeasurementXYVariables = {
      x: {
        data: [1, 2, 3, 4],
        symbol: 'X',
        label: 'x value',
        units: 'x unit',
        isDependent: true,
      },
      y: {
        data: [2, 3, 4, 5],
        symbol: 'Y',
        label: 'y value',
        units: 'y unit',
        isDependent: false,
      },
      z: {
        data: [3, 4, 5, 6],
        symbol: 'T',
        label: 't value',
        units: 't unit',
        isDependent: true,
      },
    };

    const jcamp = fromVariables(variables, {
      meta: {
        meta1: 'value1',
        meta2: 'value2',
      },
      info: {
        title: 'Hello world',
        dataType: 'TEST',
      },
    });

    const converted = convert(jcamp, { keepRecordsRegExp: /^\$.*/ }).flatten[0];

    expect(converted.meta).toStrictEqual({ meta1: 'value1', meta2: 'value2' });

    expect(converted.spectra[0].data).toStrictEqual({
      x: [1, 2, 3, 4],
      y: [2, 3, 4, 5],
      t: [3, 4, 5, 6],
    });

    expect(converted.spectra[0].variables).toStrictEqual({
      x: {
        name: 'x value',
        symbol: 'X',
        type: 'DEPENDENT',
        dim: 4,
        first: 1,
        last: 4,
        max: 4,
        min: 1,
        units: 'x unit',
        data: [1, 2, 3, 4],
      },
      y: {
        name: 'y value',
        symbol: 'Y',
        type: 'INDEPENDENT',
        dim: 4,
        first: 2,
        last: 5,
        max: 5,
        min: 2,
        units: 'y unit',
        data: [2, 3, 4, 5],
      },
      t: {
        name: 't value',
        symbol: 'T',
        type: 'DEPENDENT',
        dim: 4,
        first: 3,
        last: 6,
        max: 6,
        min: 3,
        units: 't unit',
        data: [3, 4, 5, 6],
      },
    });
  });

  it('3 variables width specific independent / dependent', () => {
    const variables: MeasurementXYVariables = {
      x: {
        data: [1, 2, 3, 4],
        symbol: 'X',
        label: 'x value',
        units: 'x unit',
        isDependent: true,
      },
      y: {
        data: [2, 3, 4, 5],
        symbol: 'Y',
        label: 'y value',
        units: 'y unit',
        isDependent: false,
      },
      z: {
        data: [3, 4, 5, 6],
        symbol: 'T',
        label: 't value',
        units: 't unit',
        isDependent: true,
      },
    };

    const jcamp = fromVariables(variables);

    const converted = convert(jcamp, { keepRecordsRegExp: /^\$.*/ }).flatten[0];

    expect(converted.spectra[0].variables).toStrictEqual({
      x: {
        name: 'x value',
        symbol: 'X',
        type: 'DEPENDENT',
        dim: 4,
        first: 1,
        last: 4,
        max: 4,
        min: 1,
        units: 'x unit',
        data: [1, 2, 3, 4],
      },
      y: {
        name: 'y value',
        symbol: 'Y',
        type: 'INDEPENDENT',
        dim: 4,
        first: 2,
        last: 5,
        max: 5,
        min: 2,
        units: 'y unit',
        data: [2, 3, 4, 5],
      },
      t: {
        name: 't value',
        symbol: 'T',
        type: 'DEPENDENT',
        dim: 4,
        first: 3,
        last: 6,
        max: 6,
        min: 3,
        units: 't unit',
        data: [3, 4, 5, 6],
      },
    });
  });

  it('3 variables with label', () => {
    const variables: MeasurementXYVariables = {
      x: { data: [1, 2, 3, 4], symbol: 'X', label: 'x value [x unit]' },
      y: { data: [2, 3, 4, 5], symbol: 'Y', label: 'y value [y unit]' },
      z: { data: [3, 4, 5, 6], symbol: 'T', label: 't value [t unit]' },
    };

    const jcamp = fromVariables(variables, {
      meta: {
        meta1: 'value1',
        meta2: 'value2',
      },
      info: {
        title: 'Hello world',
        dataType: 'TEST',
      },
    });

    const converted = convert(jcamp, { keepRecordsRegExp: /^\$.*/ }).flatten[0];

    expect(converted.meta).toStrictEqual({ meta1: 'value1', meta2: 'value2' });

    expect(converted.spectra[0].variables).toStrictEqual({
      x: {
        name: 'x value',
        units: 'x unit',
        symbol: 'X',
        type: 'INDEPENDENT',
        dim: 4,
        first: 1,
        last: 4,
        max: 4,
        min: 1,
        data: [1, 2, 3, 4],
      },
      y: {
        name: 'y value',
        units: 'y unit',
        symbol: 'Y',
        type: 'DEPENDENT',
        dim: 4,
        first: 2,
        last: 5,
        max: 5,
        min: 2,
        data: [2, 3, 4, 5],
      },
      t: {
        name: 't value',
        units: 't unit',
        symbol: 'T',
        type: 'DEPENDENT',
        dim: 4,
        first: 3,
        last: 6,
        max: 6,
        min: 3,
        data: [3, 4, 5, 6],
      },
    });
  });

  it('x / y variables no force', () => {
    const variables: MeasurementXYVariables = {
      x: { data: [1, 2, 3, 4], label: 'x value', units: 'x unit' },
      y: { data: [2, 3, 4, 5], label: 'y value', units: 'y unit' },
    };

    const jcamp = fromVariables(variables, {
      meta: {
        meta1: 'value1',
        meta2: 'value2',
      },
      info: {
        title: 'Hello world',
        dataType: 'TEST',
        console: '55',
      },
      xyEncoding: 'DIFDUP',
    });

    const converted = convert(jcamp, { keepRecordsRegExp: /^\$.*/ }).flatten[0];
    expect(converted.meta).toStrictEqual({ meta1: 'value1', meta2: 'value2' });

    expect(converted.spectra[0]).toStrictEqual({
      xUnits: 'x value (x unit)',
      yUnits: 'y value (y unit)',
      firstX: 1,
      lastX: 4,
      firstY: 2,
      lastY: 5,
      nbPoints: 4,
      xFactor: 1,
      yFactor: 1,
      isPeaktable: true,
      data: { x: [1, 2, 3, 4], y: [2, 3, 4, 5] },
    });
  });

  it('x / y variables, forceNtuples', () => {
    const variables: MeasurementXYVariables = {
      x: { data: [1, 2, 3, 4], label: 'x value', units: 'x unit' },
      y: { data: [2, 3, 4, 5], label: 'y value', units: 'y unit' },
    };

    const jcamp = fromVariables(variables, {
      forceNtuples: true,
      meta: {
        meta1: 'value1',
        meta2: 'value2',
      },
      info: {
        title: 'Hello world',
        dataType: 'TEST',
      },
    });

    const converted = convert(jcamp, { keepRecordsRegExp: /^\$.*/ }).flatten[0];

    expect(converted.meta).toStrictEqual({ meta1: 'value1', meta2: 'value2' });

    expect(converted.spectra[0]).toStrictEqual({
      page: 'N=1',
      pageValue: 1,
      pageSymbol: 'N',
      variables: {
        x: {
          name: 'x value',
          symbol: 'x',
          type: 'INDEPENDENT',
          dim: 4,
          first: 1,
          last: 4,
          max: 4,
          min: 1,
          units: 'x unit',
          data: [1, 2, 3, 4],
        },
        y: {
          name: 'y value',
          symbol: 'y',
          type: 'DEPENDENT',
          dim: 4,
          first: 2,
          last: 5,
          max: 5,
          min: 2,
          units: 'y unit',
          data: [2, 3, 4, 5],
        },
      },
      nbPoints: 4,
      xUnits: 'x value [x unit]',
      yUnits: 'y value [y unit]',
      datatable: '(xy..xy)',
      firstX: 1,
      firstY: 2,
      lastX: 4,
      lastY: 5,
      xFactor: 1,
      yFactor: 1,
      isPeaktable: true,
      data: { x: [1, 2, 3, 4], y: [2, 3, 4, 5] },
    });
  });

  it('x / y variables, forceNtuples and type', () => {
    const variables: MeasurementXYVariables = {
      x: {
        data: [1, 2, 3, 4],
        label: 'x value',
        units: 'x unit',
        isDependent: true,
      },
      y: {
        data: [2, 3, 4, 5],
        label: 'y value',
        units: 'y unit',
        isDependent: false,
      },
    };

    const jcamp = fromVariables(variables, {
      forceNtuples: true,
      meta: {
        meta1: 'value1',
        meta2: 'value2',
        abcd: { ab: 1, cd: 'b' },
      },
      info: {
        title: 'Hello world',
        dataType: 'TEST',
      },
    });
    const converted = convert(jcamp, { keepRecordsRegExp: /^\$.*/ }).flatten[0];
    expect(converted.meta).toStrictEqual({
      meta1: 'value1',
      meta2: 'value2',
      abcd: '{"ab":1,"cd":"b"}',
    });
    expect(converted.spectra[0]).toStrictEqual({
      page: 'N=1',
      pageValue: 1,
      pageSymbol: 'N',
      variables: {
        x: {
          name: 'x value',
          symbol: 'x',
          type: 'DEPENDENT',
          dim: 4,
          first: 1,
          last: 4,
          max: 4,
          min: 1,
          units: 'x unit',
          data: [1, 2, 3, 4],
        },
        y: {
          name: 'y value',
          symbol: 'y',
          type: 'INDEPENDENT',
          dim: 4,
          first: 2,
          last: 5,
          max: 5,
          min: 2,
          units: 'y unit',
          data: [2, 3, 4, 5],
        },
      },
      nbPoints: 4,
      xUnits: 'x value [x unit]',
      yUnits: 'y value [y unit]',
      datatable: '(xy..xy)',
      xFactor: 1,
      yFactor: 1,
      firstX: 1,
      firstY: 2,
      lastX: 4,
      lastY: 5,
      isPeaktable: true,
      data: { x: [1, 2, 3, 4], y: [2, 3, 4, 5] },
    });
  });
});
