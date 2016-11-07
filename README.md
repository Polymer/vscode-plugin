# Polymer IDE

Unlocks all of the power of the [Polymer Analyzer] in [VS Code]. See the [Polymer Editor Service] for more info, including links to plugins for other editors.

Features:

 * typeahead completions for imported elements, with documentation
 * typeahead completions for element attributes, with documentation
 * inline errors (squiggle underlines)
 * jump to definition support for custom elements and attributes

## Installing

In quick open (ctrl/cmd + P), run this command: `ext install polymer-ide`, or see it in the marketplace [here](https://marketplace.visualstudio.com/items?itemName=polymer.polymer-ide).

### Try it out on a simple example project

    git clone git@github.com:Polymer/vscode-plugin.git
    cd vscode-plugin/example_project
    bower install
    code ./

## Developing

> Node: Most of the vscode plugin's logic exists in the [Polymer Editor Service], so most changes will involve modifying that and using `npm link polymer-editor-service` in this package.

To develop:

    npm install
    code .

Then just press F5 to start a debug instance of vscode with the local version of the plugin running.


[Polymer Analyzer]: https://github.com/Polymer/polymer-analyzer
[polymer editor service]: https://github.com/Polymer/polymer-editor-service
[VS Code]: https://code.visualstudio.com/
