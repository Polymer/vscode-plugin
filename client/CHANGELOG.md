# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased]

<!-- PRs should document any user-visible changes here. -->

### Added
* Add an icon.

## [0.1.1] - 2016-10-25

### Fixed
* Fix Windows support, as well as projects with paths with characters that need URL escaping (e.g. spaces). #17 #23 #28

## [0.1.0] - 2016-10-17

### Added
* Initial public release!
* Support contextual autocompletion of custom element tags and attribute names.
  * Also display docs in autocomplete for both.
* Support getting documentation popups on hover.
* Support jump to definition of custom elements and their attributes.
* Knows how to recognize:
 * Vanilla Custom Element v1 definitions.
 * Polymer 1.0 element declarations.
 * Partial support for Polymer 2.0 element declarations.
