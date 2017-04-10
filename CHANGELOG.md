<!--
  PRs should document any user-visible changes in the Unreleased section.
  Uncomment out the header as necessary.
-->

<!--## [Unreleased]-->

## 0.5.0 - 2017-04-10

* [Polymer]: support autocompletion, tooltips, and jump to definition inside Polymer databinding expressions.
* By default, warnings are now shown only for files that are currently open.
* Fixed a bug whereby edits to files would not immediately affect files that depended on them.
* New setting: `polymer-ide.analyzeWholePackage`. When true, warnings will be reported for all files in the package, not just those that are open. Warnings will be more accurate but the initial analysis will be slower.

## 0.4.3 - 2017-03-20

* Added many more lint rules.
* Fixed a number of issues around recognizing Polymer 2.0 element declaration patterns. e.g. https://github.com/Polymer/vscode-plugin/issues/54 and https://github.com/Polymer/vscode-plugin/issues/53

## 0.4.2 - 2017-03-02

### Fixed

* Fixed a class of issue where the IDE could fail to initialize. For example, projects with certain `polymer.json` keys, including Polymer Starter Kit. https://github.com/Polymer/vscode-plugin/issues/48
* Now using vscode's URI implementation. This should eliminate any remaining issues on Windows.
* Includes a number of powerful new lint passes. See [polymer-linter](https://github.com/Polymer/polymer-linter/blob/master/CHANGELOG.md#015---2017-03-03) for more info. Remember that you must configure your lint passes in polymer.json at the root of your workspace.


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
