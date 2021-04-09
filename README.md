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

</h3>

## Installation

`$ npm install --save convert-to-jcamp`

## Usage

### From text file

```js
import { fromText } from 'convert-to-jcamp';

const testData = `1 2
2 3
3 4
4 5
5 6
6 7
7 8
8 9`;
const options = {
  info: {
    title: 'test',
    owner: 'cheminfo',
    origin: 'manually',
    type: 'MASS SPECTRUM',
    xUnit: 'M/Z',
    yUnit: 'relative abundance',
  },
  meta: {
    info1: 'value1',
    info2: 'value2'
  }
};
const jcamp = fromText(testData, options);
```

### From Json

```js
import { fromJSON } from '..';

const data = {
  x: [1, 2],
  y: [2, 3]
};
const jcamp = fromJSON(data, {});
```

### From Variables

```js
const variables = {
  x: { 
    data: [1, 2, 3, 4],
    name: 'x value',
    units: 'x unit',
    type: 'INDEPENDENT',
  },
  y: { data: [2, 3, 4, 5], name: 'y value', units: 'y unit' },
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

## [API Documentation](https://cheminfo-js.github.io/convert-to-jcamp/)

## License

[MIT](./LICENSE)

[npm-image]: https://img.shields.io/npm/v/convert-to-jcamp.svg?style=flat-square
[npm-url]: https://npmjs.org/package/convert-to-jcamp
[travis-image]: https://img.shields.io/travis/cheminfo-js/convert-to-jcamp/master.svg?style=flat-square
[travis-url]: https://travis-ci.org/cheminfo-js/convert-to-jcamp
[codecov-image]: https://img.shields.io/codecov/c/github/cheminfo-js/convert-to-jcamp.svg?style=flat-square
[codecov-url]: https://codecov.io/gh/cheminfo-js/convert-to-jcamp
[download-image]: https://img.shields.io/npm/dm/convert-to-jcamp.svg?style=flat-square
[download-url]: https://npmjs.org/package/convert-to-jcamp
