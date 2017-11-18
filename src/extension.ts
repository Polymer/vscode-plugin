/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for
 * license information.
 * ------------------------------------------------------------------------------------------
 */
'use strict';

import * as path from 'path';

import {workspace, Disposable, ExtensionContext, commands, WorkspaceEdit, Uri, Range, Position} from 'vscode';
import {LanguageClient, LanguageClientOptions, SettingMonitor, ServerOptions, TransportKind, WorkspaceEdit as WorkspaceEditRaw} from 'vscode-languageclient';

export function activate(context: ExtensionContext) {
  // The server is pulled in from npm, and can be found in our node_modules dir.
  let serverModule = context.asAbsolutePath(path.join('node_modules','polymer-editor-service', 'lib', 'polymer-language-server.js'));
  // The debug options for the server
  let debugOptions = {execArgv: ['--nolazy', '--debug=6004']};

  // If the extension is launched in debug mode then the debug server options
  // are used.
  // Otherwise the run options are used.
  let serverOptions: ServerOptions = {
    run: {module: serverModule, transport: TransportKind.stdio},
    debug: {
      module: serverModule,
      transport: TransportKind.stdio,
      options: debugOptions
    }
  };

  // Options to control the language client
  let clientOptions: LanguageClientOptions = {
    // Register the server for the appropriate file types.
    documentSelector: ['html', 'javascript', 'css'],
    synchronize: {
      // Synchronize the setting section 'polymer-ide' to the server
      configurationSection: 'polymer-ide',
      // Notify the server about file changes to '.clientrc files contain in the
      // workspace
      fileEvents: workspace.createFileSystemWatcher('**/.clientrc')
    }
  };

  // Create the language client and start the client.
  let disposable = new LanguageClient(
                       'polymer-ide', serverOptions, clientOptions)
                       .start();
  context.subscriptions.push(commands.registerCommand(
    'polymer-ide/applyEdit', async (edit: WorkspaceEditRaw) => {
      const realEdit = convertFromProtocol(edit);
      const applied = await workspace.applyEdit(realEdit);
    })
  );
  function convertFromProtocol(edit: WorkspaceEditRaw) {
    const realEdit = new WorkspaceEdit();
    const changes = edit.changes!;
    for (const uri of Object.keys(changes)) {
      for (const change of changes[uri]) {
        const range = new Range(
          new Position(change.range.start.line, change.range.start.character),
          new Position(change.range.end.line, change.range.end.character));
        realEdit.replace(Uri.parse(uri), range, change.newText);
      }
    }
    return realEdit;
  }
  // Push the disposable to the context's subscriptions so that the
  // client can be deactivated on extension deactivation
  context.subscriptions.push(disposable);
}
