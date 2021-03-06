/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for
 * license information.
 * ------------------------------------------------------------------------------------------
 */
'use strict';

import * as path from 'path';

import {workspace, Disposable, ExtensionContext, commands, WorkspaceEdit, TextEdit, Uri, Range, Position} from 'vscode';
import {LanguageClient, LanguageClientOptions, SettingMonitor, ServerOptions, TransportKind, WorkspaceEdit as WorkspaceEditRaw, TextEdit as TextEditRaw, WillSaveTextDocumentWaitUntilRequest, Range as RangeRaw} from 'vscode-languageclient';

export function activate(context: ExtensionContext) {
  // The server is pulled in from npm, and can be found in our node_modules dir.
  let serverModule = context.asAbsolutePath(path.join(
      'node_modules', 'polymer-editor-service', 'lib',
      'polymer-language-server.js'));
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
    documentSelector: ['html', 'javascript', 'css', 'json'],
    synchronize: {
      // Synchronize the setting section 'polymer-ide' to the server
      configurationSection: 'polymer-ide',
      // Notify the server about changes to any files in the workspace
      fileEvents: workspace.createFileSystemWatcher('**')
    },
  };

  // Create the language client and start the client.
  const languageClient =
      new LanguageClient('polymer-ide', serverOptions, clientOptions);
  const disposable = languageClient.start();
  context.subscriptions.push(disposable);

  // Push the disposable to the context's subscriptions so that the
  // client can be deactivated on extension deactivation
  context.subscriptions.push(disposable);
}
