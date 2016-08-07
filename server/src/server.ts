/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for
 * license information.
 * ------------------------------------------------------------------------------------------
 */
'use strict';

import * as path from 'path';

import {Hover, Location, Range, IPCMessageReader, IPCMessageWriter, createConnection, IConnection, TextDocumentSyncKind, TextDocuments, TextDocument, Diagnostic, DiagnosticSeverity, InitializeParams, InitializeResult, TextDocumentPositionParams, CompletionItem, CompletionItemKind} from 'vscode-languageserver';
import * as vscode from 'vscode-languageserver';
import {Analyzer} from 'polymer-analyzer';
import {FSUrlLoader} from 'polymer-analyzer/lib/url-loader/fs-url-loader';
import {EditorService, Position} from 'polymer-analyzer/lib/editor-service';

// The settings interface describe the server relevant settings part
interface Settings {
  languageServerExample: OurSettings;
}

// The settings we defined in the client's package.json file.
interface OurSettings {}

// Create a connection for the server. The connection uses Node's IPC as a
// transport
let connection: IConnection = createConnection(
    new IPCMessageReader(process), new IPCMessageWriter(process));

// The settings have changed. Is send on server activation
// as well.
connection.onDidChangeConfiguration((change) => {
  let settings = <Settings>change.settings;
});

let editorService: EditorService|null = null;

// Create a simple text document manager. The text document manager
// supports full document sync only
let documents: TextDocuments = new TextDocuments();
// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection);

// After the server has started the client sends an initilize request. The
// server receives
// in the passed params the rootPath of the workspace plus the client
// capabilites.
let workspaceRoot: string;
connection.onInitialize((params): InitializeResult => {
  workspaceRoot = params.rootPath;
  connection.console.log(`workspaceRoot: ${workspaceRoot}`);
  editorService = new EditorService(
      new Analyzer({urlLoader: new FSUrlLoader(workspaceRoot)}));
  documents.all().forEach(scanDocument);
  return <InitializeResult> {
    capabilities: {
      // Tell the client that the server works in FULL text document sync mode
      textDocumentSync: documents.syncKind,
      // Tell the client that the server support code complete
      completionProvider: {resolveProvider: true},
      hoverProvider: true,
      definitionProvider: true,
    }
  }
});

// The content of a text document has changed. This event is emitted
// when the text document is first opened or when its content has changed.
documents.onDidChangeContent((change) => {
  scanDocument(change.document);
});

connection.onHover(async(textPosition) => {
  const localPath = getWorkspacePathToFile(textPosition.textDocument);
  if (localPath && editorService) {
    const documentation = await editorService.getDocumentationFor(
        localPath, convertPosition(textPosition.position));
    if (documentation) {
      return {contents: documentation};
    }
  }
});

connection.onDefinition((async(textPosition) => {
  const localPath = getWorkspacePathToFile(textPosition.textDocument);
  if (localPath && editorService) {
    const location = await editorService.getDefinitionFor(
        localPath, convertPosition(textPosition.position));
    if (location && location.file) {
      let definition: Location = {
        uri: getUriForLocalPath(location.file),
        range: {
          start: {line: location.line, character: location.column},
          end: {line: location.line, character: location.column}
        }
      };
      return definition;
    }
  }
}));

connection.onDidChangeWatchedFiles((change) => {
  // Monitored files have change in VSCode
  connection.console.log('We recevied an file change event');
});


// This handler provides the initial list of the completion items.
connection.onCompletion(
    (textDocumentPosition: TextDocumentPositionParams): CompletionItem[] => {
        // The pass parameter contains the position of the text document in
        // which code complete got requested. For the example we ignore this
        // info and always provide the same completion items.
        return [
          {label: 'TypeScript', kind: CompletionItemKind.Text, data: 1},
          {label: 'JavaScript', kind: CompletionItemKind.Text, data: 2}
        ]});

// This handler resolve additional information for the item selected in
// the completion list.
connection.onCompletionResolve((item: CompletionItem): CompletionItem => {
  if (item.data === 1) {
    item.detail = 'TypeScript details',
    item.documentation = 'TypeScript documentation'
  } else if (item.data === 2) {
    item.detail = 'JavaScript details',
    item.documentation = 'JavaScript documentation'
  }
  return item;
});

function scanDocument(document: TextDocument) {
  if (editorService) {
    const localPath = getWorkspacePathToFile(document);
    if (localPath) {
      editorService.fileChanged(localPath, document.getText());
    }
  }
}

function getWorkspacePathToFile(doc: {uri: string}): string|undefined {
  const match = doc.uri.match(/^file:\/\/(.*)/);
  if (!match || !match[1] || !workspaceRoot) {
    return undefined;
  }
  return path.relative(workspaceRoot, match[1]);
}

function getUriForLocalPath(localPath: string): string {
  return `file://${workspaceRoot}/${localPath}`;
}

function convertPosition(position: vscode.Position): Position {
  return {line: position.line, column: position.character};
}

/*
connection.onDidOpenTextDocument((params) => {
        // A text document got opened in VSCode.
        // params.uri uniquely identifies the document. For documents store on
disk this is a file URI.
        // params.text the initial full content of the document.
        connection.console.log(`${params.uri} opened.`);
});

connection.onDidChangeTextDocument((params) => {
        // The content of a text document did change in VSCode.
        // params.uri uniquely identifies the document.
        // params.contentChanges describe the content changes to the document.
        connection.console.log(`${params.uri} changed:
${JSON.stringify(params.contentChanges)}`);
});

*/

// Listen on the connection
connection.listen();