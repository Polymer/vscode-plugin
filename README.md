# Polymer IDE

Unlocks all of the power of the [Polymer Analyzer] in [VS Code]. See the [Polymer Editor Service] for more info, including links to other editor plugins.

Features:

 * typeahead completions for imported elements, with documentation
 * typeahead completions for element attributes, with documentation
 * inline errors (squiggle underlines)
 * jump to definition support for custom elements and attributes

## Installing

The plugin will be published on the official marketplace once it's released. For now, download the latest `.vsix` file [directly off github](https://github.com/Polymer/vscode-plugin/releases) and install it with the `code` command on your CLI. e.g.

    code --install-extension ./polymer-plugin-0.0.2.vsix

### Try it out on a simple example project

    cd vscode-plugin/client/example_project
    bower install
    code ./

## Developing

Language server plugins to vscode are split across two separate projects, the language server and the plugin proper. For full docs, see this [page](https://code.visualstudio.com/docs/extensions/example-language-server). The tl;dr is:

    cd client
    npm install
    code .
    cd ../server
    npm install
    code .

Then in the `server` vscode window run the `build` task, which will automatically build the server on each change (or run `npm run watch` in the server directory). Then in the `client` vscode window, just press F5 to start a debug instance of vscode with the local version of the plugin running.

[Polymer Analyzer]: https://github.com/Polymer/polymer-analyzer
[polymer editor service]: https://github.com/Polymer/polymer-editor-service
[VS Code]: https://code.visualstudio.com/
