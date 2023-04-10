# Changelog

## [5.4.3](https://github.com/cheminfo/convert-to-jcamp/compare/v5.4.2...v5.4.3) (2023-04-10)


### Bug Fixes

* use spectral width for x data in nmr jcamp generation ([#65](https://github.com/cheminfo/convert-to-jcamp/issues/65)) ([4f7aa10](https://github.com/cheminfo/convert-to-jcamp/commit/4f7aa10541eb237b38aec85fbca28c8c2769473a))

## [5.4.2](https://github.com/cheminfo/convert-to-jcamp/compare/v5.4.1...v5.4.2) (2023-04-03)


### Bug Fixes

* default dataType for nmr jcamp ([#62](https://github.com/cheminfo/convert-to-jcamp/issues/62)) ([9f0dbba](https://github.com/cheminfo/convert-to-jcamp/commit/9f0dbbafafe77c9fe63e82ea8072735505ffc9b5))

## [5.4.1](https://github.com/cheminfo/convert-to-jcamp/compare/v5.4.0...v5.4.1) (2022-08-18)


### Bug Fixes

* small refactor to nmr related function. ([#55](https://github.com/cheminfo/convert-to-jcamp/issues/55)) ([af7a7af](https://github.com/cheminfo/convert-to-jcamp/commit/af7a7afbdb07748cee56b53b9659a52a8a007e6c))

## [5.4.0](https://github.com/cheminfo/convert-to-jcamp/compare/v5.3.1...v5.4.0) (2022-08-18)


### Features

* add from1DNMRVariables function ([#53](https://github.com/cheminfo/convert-to-jcamp/issues/53)) ([d72f34f](https://github.com/cheminfo/convert-to-jcamp/commit/d72f34f230819510ca7b26c2f5e86997a2ee4907))

## [5.3.1](https://github.com/cheminfo/convert-to-jcamp/compare/v5.3.0...v5.3.1) (2022-08-02)


### Bug Fixes

* **ntuples:** x data from 0 - nbPoints ([#49](https://github.com/cheminfo/convert-to-jcamp/issues/49)) ([31213b0](https://github.com/cheminfo/convert-to-jcamp/commit/31213b02be924111d36d7a19a89f2540c8f718be))

## [5.3.0](https://github.com/cheminfo/convert-to-jcamp/compare/v5.2.0...v5.3.0) (2022-07-26)


### Features

* **creatorNtuples:** use factors from options ([#45](https://github.com/cheminfo/convert-to-jcamp/issues/45)) ([64e07dd](https://github.com/cheminfo/convert-to-jcamp/commit/64e07dd54dd68e28698850f67d459dbd6e22d614))

## [5.2.0](https://github.com/cheminfo/convert-to-jcamp/compare/v5.1.1...v5.2.0) (2022-03-04)


### Features

* add from2DNMRVariables ([9711cd7](https://github.com/cheminfo/convert-to-jcamp/commit/9711cd7c3267f9af98e80b1282171ed5e86ecca6))

### [5.1.1](https://www.github.com/cheminfo/convert-to-jcamp/compare/v5.1.0...v5.1.1) (2021-12-15)


### Bug Fixes

* update dependencies to use typescript definition from jcampconverter ([94eaa54](https://www.github.com/cheminfo/convert-to-jcamp/commit/94eaa543e8654d158caca5e8de5256d03d808a0c))

## [5.1.0](https://www.github.com/cheminfo/convert-to-jcamp/compare/v5.0.1...v5.1.0) (2021-11-30)


### Features

* add ensureInteger ([080b236](https://www.github.com/cheminfo/convert-to-jcamp/commit/080b236a9d1de6f8fba39fad0da0298dc9a967d2))
* ensure xyData are integers ([1565927](https://www.github.com/cheminfo/convert-to-jcamp/commit/15659277c2cab5748fee43fa913df9c27487d325))


### Bug Fixes

* present issues after refactor ([#38](https://www.github.com/cheminfo/convert-to-jcamp/issues/38)) ([a876e08](https://www.github.com/cheminfo/convert-to-jcamp/commit/a876e080bd3c580d8a8c5685fe360dc040c925bc)), closes [#33](https://www.github.com/cheminfo/convert-to-jcamp/issues/33) [#34](https://www.github.com/cheminfo/convert-to-jcamp/issues/34)

### [5.0.1](https://www.github.com/cheminfo/convert-to-jcamp/compare/v5.0.0...v5.0.1) (2021-11-28)


### Bug Fixes

* compression algorithm was ignored ([9d2ff74](https://www.github.com/cheminfo/convert-to-jcamp/commit/9d2ff74dc582135cee226bce49f52ec52700217c))

## [5.0.0](https://www.github.com/cheminfo/convert-to-jcamp/compare/v4.8.0...v5.0.0) (2021-11-26)


### ⚠ BREAKING CHANGES

* delete fromJson and fromText

### Features

* add data encoder ([#29](https://www.github.com/cheminfo/convert-to-jcamp/issues/29)) ([c389c68](https://www.github.com/cheminfo/convert-to-jcamp/commit/c389c68b8958f0ca9cb377c3aafbafd9e0747cd8))
* add type for XYEncoding ([664801d](https://www.github.com/cheminfo/convert-to-jcamp/commit/664801ddaa0445c40f10932683292bfc02b300c7))
* delete fromJson and fromText ([db87364](https://www.github.com/cheminfo/convert-to-jcamp/commit/db873644d1a56395e9e59cb5f038015d414b67a2))


### Bug Fixes

* adapt demo to ts ([26fe5c0](https://www.github.com/cheminfo/convert-to-jcamp/commit/26fe5c04b07dea83b85f90336a2be5b88092d5a8))
* adapt getNumber to ts ([f45ecea](https://www.github.com/cheminfo/convert-to-jcamp/commit/f45ecea493b83becd42b11ddfdfc2b89c2b51360))
* adapt test to ts ([09b50aa](https://www.github.com/cheminfo/convert-to-jcamp/commit/09b50aa0eb326bd1380523959294eeb921985a61))
* add fromJSON from branch master ([dc08099](https://www.github.com/cheminfo/convert-to-jcamp/commit/dc08099d61b99bee0843768aa8186c110e39926f))
* add interfaces ([4100ed4](https://www.github.com/cheminfo/convert-to-jcamp/commit/4100ed479b26815bb0407b10fd7c81b6eb9eadc9))
* data types ([4124114](https://www.github.com/cheminfo/convert-to-jcamp/commit/4124114c3b186ed534012a9a267af4b927d590a5))
* data types ([8adfefb](https://www.github.com/cheminfo/convert-to-jcamp/commit/8adfefb14bc7e78aa2258807b820b2514298f26e))
* fix some eslint errors ([266245f](https://www.github.com/cheminfo/convert-to-jcamp/commit/266245f1c5fd93bd4c9a73c3857982577dfc7526))
* remove fromJSON and fromText ([49846a9](https://www.github.com/cheminfo/convert-to-jcamp/commit/49846a929433c64e2fab4404fbbc1d4f7bf62a0d))
* remove useless interfaces ([1eef7ca](https://www.github.com/cheminfo/convert-to-jcamp/commit/1eef7ca170ca62534052780acfc416514081cd5e))
* rename interface SpectrumInfo to JcampInfo ([dfa5dc0](https://www.github.com/cheminfo/convert-to-jcamp/commit/dfa5dc0853907a1d6aa830db1984d5fbe4c72276))
* start adding interface ([f2e96ff](https://www.github.com/cheminfo/convert-to-jcamp/commit/f2e96ffaa0e89b3b3bcb659ecaa85e61cfda9633))
* type issues ([2dba24f](https://www.github.com/cheminfo/convert-to-jcamp/commit/2dba24fa02390bffa0649981ab29b77e160120fc))
* xyDataCreator ([#27](https://www.github.com/cheminfo/convert-to-jcamp/issues/27)) ([b9f0627](https://www.github.com/cheminfo/convert-to-jcamp/commit/b9f0627a53bf5d437322814f9b1975cdd8d7263c))

## [4.8.0](https://www.github.com/cheminfo/convert-to-jcamp/compare/v4.7.0...v4.8.0) (2021-09-17)


### Features

* check variables.isDependent boolean for ntuples generation ([6003cd1](https://www.github.com/cheminfo/convert-to-jcamp/commit/6003cd1e2ee53fe81511187f506f404a824dc477))

## [4.7.0](https://www.github.com/cheminfo/convert-to-jcamp/compare/v4.6.0...v4.7.0) (2021-07-25)


### Features

* add xFactor and yFactor ([de58759](https://www.github.com/cheminfo/convert-to-jcamp/commit/de58759cb1b8436a22fa2251a5369779aef58415))

## [4.6.0](https://www.github.com/cheminfo/convert-to-jcamp/compare/v4.5.0...v4.6.0) (2021-07-24)


### Features

* add option to have dataxy encoding ([529e761](https://www.github.com/cheminfo/convert-to-jcamp/commit/529e76188cf53a84b9637a6aa6b2ddadd9885d99))
* update dependencies ([4ba14ce](https://www.github.com/cheminfo/convert-to-jcamp/commit/4ba14ce4f86f1b50e60570ca2690a64fd95c8258))

## [4.5.0](https://www.github.com/cheminfo/convert-to-jcamp/compare/v4.4.0...v4.5.0) (2021-05-05)

### Features

- any meta property of type 'object' is stringify ([2144966](https://www.github.com/cheminfo/convert-to-jcamp/commit/21449667827ed67c7fed7eac34ef80895b0a6e3a))

## [4.4.0](https://www.github.com/cheminfo/convert-to-jcamp/compare/v4.3.1...v4.4.0) (2021-04-27)

### Features

- update dependency and parse cheminfo meta property ([a6dc3b0](https://www.github.com/cheminfo/convert-to-jcamp/commit/a6dc3b030cf63a91ed267c179bd0f90bf6d24690))

### [4.3.1](https://www.github.com/cheminfo/convert-to-jcamp/compare/v4.3.0...v4.3.1) (2021-04-27)

### Bug Fixes

- build and test covereage ([6a45ce0](https://www.github.com/cheminfo/convert-to-jcamp/commit/6a45ce06fa51f7961413d95f1798f26cd1aeeda9))

## [4.3.0](https://github.com/cheminfo/convert-to-jcamp/compare/v4.1.1...v4.3.0) (2021-04-27)

### Features

- add cheminfo.meta options saved in ORG.CHEMINFO.META LDR ([762d7d5](https://github.com/cheminfo/convert-to-jcamp/commit/762d7d5655b375b4b6a21ae3536a058fa67f2047))
- allow to specify variable type (dependent / independent) ([b2079ef](https://github.com/cheminfo/convert-to-jcamp/commit/b2079ef1f9512bba7eee749f086f939986e5a26a))

### Bug Fixes

- add testcases for ORG.CHEMINFO.META ([474cfe8](https://github.com/cheminfo/convert-to-jcamp/commit/474cfe8ba58555e04e2191fb4cf8ade32ff31950))

## [4.1.1](https://github.com/cheminfo/convert-to-jcamp/compare/v4.1.0...v4.1.1) (2020-06-24)

### Bug Fixes

- varName to name and extra space ([318ff9b](https://github.com/cheminfo/convert-to-jcamp/commit/318ff9b0e143922db7d076f0bb56ec58acb26de2))

# [4.1.0](https://github.com/cheminfo/convert-to-jcamp/compare/v4.0.1...v4.1.0) (2020-06-24)

### Features

- deal with label property in variable ([21eea52](https://github.com/cheminfo/convert-to-jcamp/commit/21eea52537234dbc9b5c6401b303a19aaab7a9f9))

## [4.0.1](https://github.com/cheminfo/convert-to-jcamp/compare/v4.0.0...v4.0.1) (2020-06-24)

### Bug Fixes

- properties of variables are lowercase ([efa700d](https://github.com/cheminfo/convert-to-jcamp/commit/efa700d16dd8e64a59c09d6522014d9377e593e4))

# [4.0.0](https://github.com/cheminfo/convert-to-jcamp/compare/v3.1.1...v4.0.0) (2020-06-24)

### Bug Fixes

- allow lowercase or uppercase variables ([b602e51](https://github.com/cheminfo/convert-to-jcamp/commit/b602e51a3ceb967f0c6db8e9af89d7b19e13ad6c))

### Features

- add fromVariables ([b20e667](https://github.com/cheminfo/convert-to-jcamp/commit/b20e6678d1cde72c4c07cbcb42b9e651f827d62f))

## [3.1.1](https://github.com/cheminfo/convert-to-jcamp/compare/v3.1.0...v3.1.1) (2020-06-21)

### Bug Fixes

- hard coded var names in ntuple ([d246301](https://github.com/cheminfo/convert-to-jcamp/commit/d24630137c13fbc3b42aea07ab5004ed92430390))

# [3.1.0](https://github.com/cheminfo/convert-to-jcamp/compare/v3.0.0...v3.1.0) (2020-06-11)

### Bug Fixes

- update name xUnits and yUnits ([fe61275](https://github.com/cheminfo/convert-to-jcamp/commit/fe612753da6690137af0ea8a7da6591f72537170))

### BREAKING CHANGES

- The parameters name where changed in order to reflect correct
  xUnits and yUnits LDR
- xUnit -> xUnits
- yUnit -> yUnits

# [3.0.0](https://github.com/cheminfo/convert-to-jcamp/compare/v2.0.1...v3.0.0) (2020-06-11)

### Features

- meta options for meta information ([df7996f](https://github.com/cheminfo/convert-to-jcamp/commit/df7996fa9323e9b837fb7c0c2c4d1367855d27fd))
- rename type to dataType ([54949fb](https://github.com/cheminfo/convert-to-jcamp/commit/54949fbc028c37b02ad770bcf91bc278272efad8))

### BREAKING CHANGES

- The options contains now 2 fields
- info: contains general information like title, dataType
- meta: contains meta information that will end up as '$' labeled records
- In order to respect the name in the final jcamp the
  parameter `type` has been renamed to `dataType`

<a name="1.0.0"></a>

# [1.0.0](https://github.com/cheminfo/convert-to-jcamp/compare/v0.2.0...v1.0.0) (2018-02-12)

### Features

- parse from an arrray of points or a xy object ([ec138d2](https://github.com/cheminfo/convert-to-jcamp/commit/ec138d2))

<a name="0.1.1"></a>

## [0.1.1](https://github.com/cheminfo/convert-to-jcamp/compare/v0.1.0...v0.1.1) (2017-07-31)

<a name="0.1.0"></a>

# 0.1.0 (2017-07-31)

### Features

- initial implementation ([#1](https://github.com/cheminfo/convert-to-jcamp/issues/1)) ([c4ac188](https://github.com/cheminfo/convert-to-jcamp/commit/c4ac188))
