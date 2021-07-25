# Changelog

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
