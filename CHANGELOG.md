# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Deprecated
- Deprecate using `baseUrl` and `useBothWays` as individual parameters in `DomWordReplacer.replace()` method. Use `options` object instead.

### Changed
- Replace `.replace(...)` method parameters with an `options` config object

### Added
- Add 'suggestionMode' config option
- Add option to mimic capitalization in replacements
- Add jsdoc support

### Fixed
- Code cleanup, add Replacer class

## [0.9.8] - 2021-04-22
### Fixed
- Code cleanup; README update, add Utils class
- Verify case sensitivity for lookups, add tests


## [0.9.7] - 2021-04-21
### Fixed
- Fixed typo in entrypoint in extension.json

## [0.9.6] - 2021-04-21
### Added
- Add 'showDictionaryKeys' config option

### Fixed
- Make sure RegExp lookup ignore case sensitivity

### Changed
- Build steps test and coverage changed

## [0.9.5] - 2021-04-19
### Added
- Ability to do two-way replacements without reserializing (optimization)

### Changed
- Replace using xpath with NodeIterator (optimization)

## [0.9.4] - 2021-04-19
### Fixed
- Replace xmlserializer with jsdom serializer to fix a bug with reserializing the DOM

### Added
- Add tests for single words inside DOM elements

## [0.9.3] - 2021-04-18
### Added
- Add pre-publish build step to automate npm package publishing

## [0.9.2] - 2021-04-18
### Fixed
- Add .npmignore and exclude /dist folder; make the package actually work

## [0.9.1] - 2021-04-18
### Changed
- Change using 'alt' prop to 'title'
- Escape search terms with word boundaries

## [0.9.0] - 2021-04-18
### Added
- Initial test release

[Unreleased]: https://github.com/mooeypoo/dom-word-replacer/compare/0.9.8...HEAD
[0.9.8]: https://github.com/mooeypoo/dom-word-replacer/compare/0.9.7...0.9.8
[0.9.7]: https://github.com/mooeypoo/dom-word-replacer/compare/0.9.6...0.9.7
[0.9.6]: https://github.com/mooeypoo/dom-word-replacer/compare/0.9.5...0.9.6
[0.9.5]: https://github.com/mooeypoo/dom-word-replacer/compare/0.9.4...0.9.5
[0.9.4]: https://github.com/mooeypoo/dom-word-replacer/compare/0.9.3...0.9.4
[0.9.3]: https://github.com/mooeypoo/dom-word-replacer/compare/0.9.2...0.9.3
[0.9.2]: https://github.com/mooeypoo/dom-word-replacer/compare/0.9.1...0.9.2
[0.9.1]: https://github.com/mooeypoo/dom-word-replacer/compare/0.9.0...0.9.1
[0.9.0]: https://github.com/mooeypoo/dom-word-replacer/releases/tag/0.9.0
