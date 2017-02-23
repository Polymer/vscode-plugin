<!--
  PRs should document any user-visible changes in the Unreleased section.
  Uncomment out the header as necessary.
-->

<!--## [Unreleased]-->


## 0.4.0 - 2017-02-22

### New Features

* [Polymer] Parse Polymer databinding syntax and warn for invalid syntax.
* Initial integration with the new polymer-linter. Configure it using a polymer.json file in your workspace root.
  * Known bug: need to reload the vscode window when your polymer.json changes for the changed linter settings to be visible.

## 0.3.1 - 2017-02-16

### New Features

* [Polymer] Provide a json schema for polymer.json files. This gives automatic validation, autocompletion, and hover-documentation for the fields of a polymer.json project.

## 0.3.0 - 2017-01-13

### Fixed

* No longer warn for ES6 module or async/await syntax.
* Fix several classes of race condition and deadlock that could result in a variety of incorrect warnings.
* [Polymer] Extract pseudo elements from HTML comments
* [Polymer] Property descriptors are allowed to be just a type name, like `value: String`.

### Added

* Added autocompletion for attribute values based on property information.


## 0.2.0 - 2016-11-21

### Fixed

* Updated to v1.1.1 of the editor service. This comes with some stability improvements, including:
  * better handle errors when detecting Polymer Behaviors
  * handle cyclic dependency graphs
  * See the editor service changelog for more: https://github.com/Polymer/polymer-editor-service/blob/master/CHANGELOG.md#111---2016-11-21

## 0.1.2 - 2016-10-26

### Added
* Add an icon.

### Fixed
* Internal errors no longer cause an intrusive popup. They instead log to the plugin's output tray.

## 0.1.1 - 2016-10-25

### Fixed
* Fix Windows support, as well as projects with paths with characters that need URL escaping (e.g. spaces). #17 #23 #28

## 0.1.0 - 2016-10-17

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
