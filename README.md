# convert-to-jcamp

Convert strings into JCAMP.

<h3 align="center">

  <a href="https://www.zakodium.com">
    <img src="https://www.zakodium.com/brand/zakodium-logo-white.svg" width="50" alt="Zakodium logo" />
  </a>

  <p>
    Maintained by <a href="https://www.zakodium.com">Zakodium</a>
  </p>

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][codecov-image]][codecov-url]
[![npm download][download-image]][download-url]
[![DOI](https://www.zenodo.org/badge/98869235.svg)](https://www.zenodo.org/badge/latestdoi/98869235)

</h3>

## Installation

`$ npm install convert-to-jcamp`

## Usage

### From Variables

```js
const { fromVariables } = require('convert-to-jcamp');
const variables = {
  x: {
    data: [1, 2, 3, 4],
    label: 'x value',
    units: 'x unit',
    isDependent: false,
  },
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
```

There are two functions for NMR. `from1DNMRVariables`
and `from2DNMRVariables` generates a nmr jcamp file from variables. 

```js
const { from2DNMRVariables } = require('convert-to-jcamp');

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
const jcamp = from2DNMRVariables(variables, {
  xyEncoding: 'DIFDUP',
  meta: { SFO2: 100, SFO1: 400, NUC1: '1H', NUC2: '13C' },
  info: {
    dataType: 'nD NMR SPECTRUM',
    '.OBSERVE NUCLEUS': '1H',
    '.OBSERVER FREQUENCY': 400,
  },
});
```

```js
const { from1DNMRVariables } = require('convert-to-jcamp');

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

const jcamp = from1DNMRVariables(variables, {
  xyEncoding: 'DIFDUP',
  info: {
    title: 'jcamp 1D',
    owner: 'cheminfo',
    dataType: 'NMR Spectrum',
    '.OBSERVE FREQUENCY': 600,
    '.OBSERVE NUCLEUS': '1H',
  },
  meta: { SFO1: 400, NUC1: '1H' },
});
```

An example for 1D NMR [bruker-to-jcamp](https://github.com/cheminfo/convert-to-jcamp/tree/master/demo/bruker-to-jcamp.ts) conversion is in the [demo folder](https://github.com/cheminfo/convert-to-jcamp/tree/master/demo)

## [API Documentation](https://cheminfo.github.io/convert-to-jcamp/)

## License

[MIT](./LICENSE)

[npm-image]: https://img.shields.io/npm/v/convert-to-jcamp.svg?style=flat-square
[npm-url]: https://npmjs.org/package/convert-to-jcamp
[travis-image]: https://img.shields.io/travis/cheminfo/convert-to-jcamp/master.svg?style=flat-square
[travis-url]: https://travis-ci.org/cheminfo/convert-to-jcamp
[codecov-image]: https://img.shields.io/codecov/c/github/cheminfo/convert-to-jcamp.svg?style=flat-square
[codecov-url]: https://codecov.io/gh/cheminfo/convert-to-jcamp
[download-image]: https://img.shields.io/npm/dm/convert-to-jcamp.svg?style=flat-square
[download-url]: https://npmjs.org/package/convert-to-jcamp
