"use strict";
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import * as path from "path";
import { parse as jsonParse, stringify as jsonStringify } from "comment-json";

// Track currently webview panel
let currentPanel: vscode.WebviewPanel | undefined = undefined;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    //console.log('Congratulations, your extension "jsonviewer" is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand("extension.viewJson", () => {
        // The code you place here will be executed every time your command is executed

        const columnToShowIn = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.viewColumn : undefined;

        let editor = vscode.window.activeTextEditor;
        if (!editor) {
            return; // No open text editor
        }

        if (currentPanel) {
            // If we already have a panel, show it in the target column
            currentPanel.reveal(columnToShowIn);
            currentPanel.webview.html = jsonToHTML(
                editor.document.getText(),
                editor.document.uri.toString(),
                context.extensionPath,
                currentPanel.webview
            );
        } else {
            // Create and show a new webview
            currentPanel = vscode.window.createWebviewPanel(
                "ccjsonviewer", // Identifies the type of the webview. Used internally
                "Json Viewer", // Title of the panel displayed to the user
                vscode.ViewColumn.One, // Editor column to show the new webview panel in.
                {
                    enableScripts: true,
                    localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath, "media"))],
                    retainContextWhenHidden: true
                } // Webview options. More on these later.
            );
            // And set its HTML content
            currentPanel.webview.html = jsonToHTML(
                editor.document.getText(),
                editor.document.uri.toString(),
                context.extensionPath,
                currentPanel.webview
            );
            currentPanel.onDidDispose(
                () => {
                    currentPanel = undefined;
                },
                null,
                context.subscriptions
            );
        }
    });


    context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {
    if (currentPanel) {
        currentPanel.dispose();
    }

    currentPanel = undefined;
}

/**
 * The JSONFormatter helper module. This contains two major functions, jsonToHTML and errorPage,
 * each of which returns an HTML document.
 */

/** Convert a whole JSON value / JSONP response into a formatted HTML document */
export function jsonToHTML(jsonStr: string, uri: string, rootPath: string, webView: vscode.Webview) {
    // if(typeof json === 'string'){
    //     try{
    //         json = JSON.parse(json);
    //     }
    //     catch(e){
    //         //console.log(e);
    //         let error:Error = e;

    //        return error.stack || "Unknown exception occured on JSON parse.";
    //     }

    // }
    try {
        jsonParse(jsonStr, undefined, true);
    } catch (e) {
        jsonStr = '{"error":"json format not correct."}';
    }
    return toHTML(jsonStr, uri, rootPath, webView);
    //return toHTML(jsonToHTMLBody(json), uri);
}

/** Convert a whole JSON value / JSONP response into an HTML body, without title and scripts */
// function jsonToHTMLBody(json: any) {
//   return `<div id="json">${valueToHTML(json, '<root>')}</div>`;
// }

/**
 * Encode a string to be used in HTML
 */
function htmlEncode(t: any): string {
    return typeof t !== "undefined" && t !== null
        ? t.toString().replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
        : "";
}

/**
 * Completely escape a json string
 */
function jsString(s: string): string {
    // Slice off the surrounding quotes
    s = jsonStringify(s).slice(1, -1);
    return htmlEncode(s);
}

/**
 * Is this a valid "bare" property name?
 */
function isBareProp(prop: string): boolean {
    return /^[A-Za-z_$][A-Za-z0-9_\-$]*$/.test(prop);
}

/**
 * Surround value with a span, including the given className
 */
function decorateWithSpan(value: any, className: string) {
    return `<span class="${className}">${htmlEncode(value)}</span>`;
}

// Convert a basic JSON datatype (number, string, boolean, null, object, array) into an HTML fragment.
function valueToHTML(value: any, path: string) {
    const valueType = typeof value;

    if (value === null) {
        return decorateWithSpan("null", "null");
    } else if (Array.isArray(value)) {
        return arrayToHTML(value, path);
    } else if (valueType === "object") {
        return objectToHTML(value, path);
    } else if (valueType === "number") {
        return decorateWithSpan(value, "num");
    } else if (valueType === "string" && value.charCodeAt(0) === 8203 && !isNaN(value.slice(1))) {
        return decorateWithSpan(value.slice(1), "num");
    } else if (valueType === "string") {
        if (/^(http|https|file):\/\/[^\s]+$/i.test(value)) {
            return `<a href="${htmlEncode(value)}"><span class="q">&quot;</span>${jsString(
                value
            )}<span class="q">&quot;</span></a>`;
        } else {
            return `<span class="string">&quot;${jsString(value)}&quot;</span>`;
        }
    } else if (valueType === "boolean") {
        return decorateWithSpan(value, "bool");
    }

    return "";
}

// Convert an array into an HTML fragment
function arrayToHTML(json: any, path: string) {
    if (json.length === 0) {
        return "[ ]";
    }

    let output = "";
    for (let i = 0; i < json.length; i++) {
        const subPath = `${path}[${i}]`;
        output += "<li>" + valueToHTML(json[i], subPath);
        if (i < json.length - 1) {
            output += ",";
        }
        output += "</li>";
    }
    return (
        (json.length === 0 ? "" : '<span class="collapser"></span>') + `[<ul class="array collapsible">${output}</ul>]`
    );
}

// Convert a JSON object to an HTML fragment
function objectToHTML(json: any, path: string) {
    let numProps = Object.keys(json).length;
    if (numProps === 0) {
        return "{ }";
    }

    let output = "";
    for (const prop in json) {
        let subPath = "";
        let escapedProp = jsonStringify(prop).slice(1, -1);
        const bare = isBareProp(prop);
        if (bare) {
            subPath = `${path}.${escapedProp}`;
        } else {
            escapedProp = `"${escapedProp}"`;
        }
        output += `<li><span class="prop${bare ? "" : " quoted"}" title="${htmlEncode(
            subPath
        )}"><span class="q">&quot;</span>${jsString(prop)}<span class="q">&quot;</span></span>: ${valueToHTML(
            json[prop],
            subPath
        )}`;
        if (numProps > 1) {
            output += ",";
        }
        output += "</li>";
        numProps--;
    }

    return `<span class="collapser"></span>{<ul class="obj collapsible">${output}</ul>}`;
}
/*
  // Clean up a JSON parsing error message
  function massageError(error: Error): {
    message: string;
    line?: number;
    column?: number;
  } {
    if (!error.message) {
      return error;
    }

    const message = error.message.replace(/^JSON.parse: /, '').replace(/of the JSON data/, '');
    const parts = /line (\d+) column (\d+)/.exec(message);
    if (!parts || parts.length !== 3) {
      return error;
    }

    return {
      message: htmlEncode(message),
      line: Number(parts[1]),
      column: Number(parts[2])
    };
  }

  function highlightError(data: string, lineNum?: number, columnNum?: number) {
    if (!lineNum || !columnNum) {
      return htmlEncode(data);
    }

    const lines = data.match(/^.*((\r\n|\n|\r)|$)/gm)!;

    let output = '';
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (i === lineNum - 1) {
        output += '<span class="errorline">';
        output += `${htmlEncode(line.substring(0, columnNum - 1))}<span class="errorcolumn">${htmlEncode(line[columnNum - 1])}</span>${htmlEncode(line.substring(columnNum))}`;
        output += '</span>';
      } else {
        output += htmlEncode(line);
      }
    }

    return output;
  }
  */

// Wrap the HTML fragment in a full document. Used by jsonToHTML and errorPage.
function toHTML(content: string, title: string, extPath: string, webView: vscode.Webview) {
    // Local path to main script run in the webview
    const extScriptOnDisk = vscode.Uri.file(path.join(extPath, "media", "jsoneditor.min.js"));
    const extCssOnDisk = vscode.Uri.file(path.join(extPath, "media", "jsoneditor.min.css"));

    const localCssOnDisk = vscode.Uri.file(path.join(extPath, "media", "localstyle.css"));
    const localScriptOnDisk = vscode.Uri.file(path.join(extPath, "media", "page.js"));

    // And the uri we use to load this script in the webview
    // const scriptUri = scriptPathOnDisk.with({ scheme: 'vscode-resource' });
    // const cssUri = cssPathOnDisk.with({ scheme: 'vscode-resource' });
    // upgrade to new api 2022-2
    const extScriptUri = webView.asWebviewUri(extScriptOnDisk);
    const extCssUri = webView.asWebviewUri(extCssOnDisk);

    const localCssUri = webView.asWebviewUri(localCssOnDisk);
    const localScriptUri = webView.asWebviewUri(localScriptOnDisk);

    // Use a nonce to whitelist which scripts can be run
    const nonce = getNonce();
    console.log("content = ", content);
    return `<!DOCTYPE HTML><html><head><title>${htmlEncode(title)} | Viewer</title>
        <link href="${extCssUri}" rel="stylesheet">
        <link href="${localCssUri}" rel="stylesheet">
        <script nonce="${nonce}" src="${extScriptUri}" ></script>
        </head><body><div id="jsoneditor"></div>
        <script type="text/javascript" src="${localScriptUri}">

        </script>
        <script>initDoc('${encodeURIComponent(content)}')</script>
        </body></html>`;
}

function getNonce() {
    let text = "";
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
