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

`$ npm install --save convert-to-jcamp`

## Usage

### From Variables

```js
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
