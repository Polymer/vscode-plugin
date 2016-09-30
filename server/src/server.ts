/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for
 * license information.
 * ------------------------------------------------------------------------------------------
 */
'use strict';

import * as path from 'path';

import {CompletionList, Hover, Location, Range, IPCMessageReader, IPCMessageWriter, createConnection, IConnection, TextDocumentSyncKind, TextDocuments, TextDocument, Diagnostic, DiagnosticSeverity, InitializeParams, InitializeResult, TextDocumentPositionParams, CompletionItem, CompletionItemKind} from 'vscode-languageserver';
import * as vscode from 'vscode-languageserver';
import {Analyzer} from 'polymer-analyzer';
import {FSUrlLoader} from 'polymer-analyzer/lib/url-loader/fs-url-loader';
import {PackageUrlResolver} from 'polymer-analyzer/lib/url-loader/package-url-resolver';
import {Severity} from 'polymer-analyzer/lib/warning/warning';

import {LocalEditorService} from 'polymer-editor-service/lib/local-editor-service';
import {EditorService, SourcePosition, TypeaheadCompletion} from 'polymer-editor-service/lib/editor-service';

import {SourceRange} from 'polymer-analyzer/lib/model/model';

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
  editorService = new LocalEditorService({
    urlLoader: new FSUrlLoader(workspaceRoot),
    urlResolver: new PackageUrlResolver()
  });
  documents.all().forEach(d => scanDocument(d));
  return <InitializeResult>{
    capabilities: {
      // Tell the client that the server works in FULL text document sync mode
      textDocumentSync: documents.syncKind,
      // Tell the client that the server support code complete
      completionProvider: {resolveProvider: false},
      hoverProvider: true,
      definitionProvider: true,
    }
  };
});

// The content of a text document has changed. This event is emitted
// when the text document is first opened or when its content has changed.
documents.onDidChangeContent((change) => {
  scanDocument(change.document, connection);
});



connection.onHover(async(textPosition) => {
  const localPath = getWorkspacePathToFile(textPosition.textDocument);
  if (localPath && editorService) {
    const documentation = await editorService.getDocumentationAtPosition(
        localPath, convertPosition(textPosition.position));
    if (documentation) {
      return {contents: documentation};
    }
  }
});

connection.onDefinition((async(textPosition) => {
  const localPath = getWorkspacePathToFile(textPosition.textDocument);
  if (localPath && editorService) {
    const location = await editorService.getDefinitionForFeatureAtPosition(
        localPath, convertPosition(textPosition.position));
    if (location && location.file) {
      let definition: Location = {
        uri: getUriForLocalPath(location.file),
        range: convertRange(location)
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
connection.onCompletion(async function(
    textPosition:
        TextDocumentPositionParams): Promise<CompletionList|undefined> {
  // The pass parameter contains the position of the text document in
  // which code complete got requested. For the example we ignore this
  // info and always provide the same completion items.
  const localPath = getWorkspacePathToFile(textPosition.textDocument);
  if (!localPath || !editorService) {
    return;
  }
  const completions: (TypeaheadCompletion|undefined) =
      await editorService.getTypeaheadCompletionsAtPosition(
          localPath, convertPosition(textPosition.position));
  if (!completions) {
    return;
  }
  if (completions.kind === 'element-tags') {
    return {
      isIncomplete: false,
      items: completions.elements.map(c => {
        return <CompletionItem>{
          label: `<${c.tagname}>`,
          kind: CompletionItemKind.Class,
          documentation: c.description,
          insertText: c.expandTo
        };
      }),
    };
  } else if (completions.kind === 'attributes') {
    return {
      isIncomplete: false,
      items: completions.attributes.map(a => {
        const item: CompletionItem = {
          label: a.name,
          kind: CompletionItemKind.Field,
          documentation: a.description,
          sortText: a.sortKey
        };
        if (a.type) {
          item.detail = `{${a.type}}`;
        }
        if (a.inheritedFrom) {
          if (item.detail) {
            item.detail = `${item.detail} ⊃ ${a.inheritedFrom}`;
          } else {
            item.detail = `⊃ ${a.inheritedFrom}`;
          }
        }
        return item;
      }),
    };
  } /* else if (completions.kind === 'resource-paths') {
     return {
       isIncomplete: false,
       items: completions.paths.map(p => {
         const item: CompletionItem = {label: p, kind: CompletionItemKind.File};
         if (completions.prefix && p.startsWith(completions.prefix)) {
           // Only insert text to complete the text typed so far.
           item.insertText = p.substring(completions.prefix.length);
         }
         return item;
       })
     };
   } */
});

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

function convertPosition(position: vscode.Position): SourcePosition {
  return {line: position.line, column: position.character};
}

function convertRange(range: SourceRange): Range {
  return {
    start: {line: range.start.line, character: range.start.column},
    end: {line: range.end.line, character: range.end.column}
  };
}

function convertSeverity(severity: Severity): DiagnosticSeverity {
  switch (severity) {
    case Severity.ERROR:
      return DiagnosticSeverity.Error;
    case Severity.WARNING:
      return DiagnosticSeverity.Warning;
    case Severity.INFO:
      return DiagnosticSeverity.Information;
    default:
      throw new Error(
          `This should never happen. Got a severity of ${severity}`);
  }
}

async function scanDocument(document: TextDocument, connection?: IConnection) {
  if (editorService) {
    const localPath = getWorkspacePathToFile(document);
    if (!localPath) {
      return;
    }
    editorService.fileChanged(localPath, document.getText());

    if (connection) {
      const diagnostics: Diagnostic[] = [];
      const warnings = await editorService.getWarningsForFile(localPath);
      for (const warning of warnings) {
        diagnostics.push({
          code: warning.code,
          message: warning.message,
          range: convertRange(warning.sourceRange),
          source: 'polymer',
          severity: convertSeverity(warning.severity),
        });
      }
      connection.sendDiagnostics({diagnostics, uri: document.uri});
    }
  }
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
