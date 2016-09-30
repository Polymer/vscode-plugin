# Polymer VSCode plugin

Unlocks all of the power of the [Polymer Analyzer](https://github.com/Polymer/polymer-analyzer) in your editor.

Features:

 * typeahead completions for imported elements, with documentation
 * typeahead completions for element attributes, with documentation
 * inline errors (squiggle underlines)
 * jump to definition support for custom elements and attributes

## Installing

The plugin will be published on the official marketplace once it's released. For now, download the latest `.vsix` file [directly off github](https://github.com/Polymer/vscode-plugin/releases) and install it with the `code` command on your CLI. e.g.

    code ./polymer-plugin-0.0.1.vsix

You can probably also drag and drop the file or open it directly in vscode in any of a number of other ways.

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
