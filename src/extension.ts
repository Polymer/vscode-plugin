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
  const languageClient =
      new LanguageClient('polymer-ide', serverOptions, clientOptions);
  const disposable = languageClient.start();
  context.subscriptions.push(disposable);

  // This is a workaround because it appears that vscode does not call the
  // language server's onWillSaveTextDocument method, so we must do it
  // ourselves.
  // https://github.com/Microsoft/vscode-languageserver-node/issues/274
  workspace.onWillSaveTextDocument((event) => {
    if (!workspace.getConfiguration('polymer-ide').get('fixOnSave')) {
      return;
    }
    event.waitUntil((async () => {
      const rawTextEdits = (await languageClient.sendRequest(
                               'polymer-ide/getAllFixesForFile',
                               event.document.uri.toString())) as TextEditRaw[];
      const edits = convertEditsFromProtocol(rawTextEdits);
      return edits;
    })());
  });
  function convertWorkspaceEditFromProtocol(rawEdit: WorkspaceEditRaw) {
    const edit = new WorkspaceEdit();
    const changes = rawEdit.changes!;
    for (const uri of Object.keys(changes)) {
      for (const change of changes[uri]) {
        const range = convertRangeFromProtocol(change.range);
        edit.replace(Uri.parse(uri), range, change.newText);
      }
    }
    return edit;
  }
  function convertEditsFromProtocol(rawEdits: TextEditRaw[]): TextEdit[] {
    const result = [];
    for (const rawEdit of rawEdits) {
      result.push(TextEdit.replace(
          convertRangeFromProtocol(rawEdit.range), rawEdit.newText));
    }
    return result;
  }
  function convertRangeFromProtocol(range: RangeRaw): Range {
    return new Range(
        new Position(range.start.line, range.start.character),
        new Position(range.end.line, range.end.character));
  }

  // Push the disposable to the context's subscriptions so that the
  // client can be deactivated on extension deactivation
  context.subscriptions.push(disposable);
}
