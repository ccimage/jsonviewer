'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    //console.log('Congratulations, your extension "mrchejsonviewer" is now active!');
    // Track currently webview panel
    let currentPanel: vscode.WebviewPanel | undefined = undefined;

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('extension.viewJson', () => {
        // The code you place here will be executed every time your command is executed

        const columnToShowIn = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.viewColumn : undefined;

        let editor = vscode.window.activeTextEditor;
        if (!editor) {
            return; // No open text editor
        }

        if (currentPanel) {
            // If we already have a panel, show it in the target column
            currentPanel.reveal(columnToShowIn);
            currentPanel.webview.html = jsonToHTML(editor.document.getText(), editor.document.uri.toString());
        } else {

            // Create and show a new webview
            currentPanel = vscode.window.createWebviewPanel(
                'ccjsonviewer', // Identifies the type of the webview. Used internally
                "JsonViewer", // Title of the panel displayed to the user
                vscode.ViewColumn.One, // Editor column to show the new webview panel in.
                { 
                    enableScripts: true
                } // Webview options. More on these later.
            );
            // And set its HTML content
            currentPanel.webview.html = jsonToHTML(editor.document.getText(), editor.document.uri.toString());
            
            currentPanel.onDidDispose(() => {
                currentPanel = undefined;
            }, null, context.subscriptions);
        }
    
    });

    context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {
}

/**
 * The JSONFormatter helper module. This contains two major functions, jsonToHTML and errorPage,
 * each of which returns an HTML document.
 */

/** Convert a whole JSON value / JSONP response into a formatted HTML document */
export function jsonToHTML(json: any, uri: string) {
    if(typeof json === 'string'){
        try{
            json = JSON.parse(json);
        }
        catch(e){
            //console.log(e);
            let error:Error = e;
            
           return error.stack || "Unknown exception occured on JSON parse.";
        }
        
    }
    return toHTML(jsonToHTMLBody(json), uri);
  }
  
  /** Convert a whole JSON value / JSONP response into an HTML body, without title and scripts */
  function jsonToHTMLBody(json: any) {
    return `<div id="json">${valueToHTML(json, '<root>')}</div>`;
  }
  
  
  /**
   * Encode a string to be used in HTML
   */
  function htmlEncode(t: any): string {
    return (typeof t !== "undefined" && t !== null) ? t.toString()
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      : '';
  }
  
  /**
   * Completely escape a json string
   */
  function jsString(s: string): string {
    // Slice off the surrounding quotes
    s = JSON.stringify(s).slice(1, -1);
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
      return decorateWithSpan('null', 'null');
    } else if (Array.isArray(value)) {
      return arrayToHTML(value, path);
    } else if (valueType === 'object') {
      return objectToHTML(value, path);
    } else if (valueType === 'number') {
      return decorateWithSpan(value, 'num');
    } else if (valueType === 'string' &&
              value.charCodeAt(0) === 8203 &&
              !isNaN(value.slice(1))) {
      return decorateWithSpan(value.slice(1), 'num');
    } else if (valueType === 'string') {
      if (/^(http|https|file):\/\/[^\s]+$/i.test(value)) {
        return `<a href="${htmlEncode(value)}"><span class="q">&quot;</span>${jsString(value)}<span class="q">&quot;</span></a>`;
      } else {
        return `<span class="string">&quot;${jsString(value)}&quot;</span>`;
      }
    } else if (valueType === 'boolean') {
      return decorateWithSpan(value, 'bool');
    }
  
    return '';
  }
  
  // Convert an array into an HTML fragment
  function arrayToHTML(json: any, path: string) {
    if (json.length === 0) {
      return '[ ]';
    }
  
    let output = '';
    for (let i = 0; i < json.length; i++) {
      const subPath = `${path}[${i}]`;
      output += '<li>' + valueToHTML(json[i], subPath);
      if (i < json.length - 1) {
        output += ',';
      }
      output += '</li>';
    }
    return (json.length === 0 ? '' : '<span class="collapser"></span>') +
      `[<ul class="array collapsible">${output}</ul>]`;
  }
  
  // Convert a JSON object to an HTML fragment
  function objectToHTML(json: any, path: string) {
    let numProps = Object.keys(json).length;
    if (numProps === 0) {
      return '{ }';
    }
  
    let output = '';
    for (const prop in json) {
      let subPath = '';
      let escapedProp = JSON.stringify(prop).slice(1, -1);
      const bare = isBareProp(prop);
      if (bare) {
        subPath = `${path}.${escapedProp}`;
      } else {
        escapedProp = `"${escapedProp}"`;
      }
      output += `<li><span class="prop${(bare ? '' : ' quoted')}" title="${htmlEncode(subPath)}"><span class="q">&quot;</span>${jsString(prop)}<span class="q">&quot;</span></span>: ${valueToHTML(json[prop], subPath)}`;
      if (numProps > 1) {
        output += ',';
      }
      output += '</li>';
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
  function toHTML(content: string, title: string) {
    return `<!DOCTYPE html>
  <html><head><title>${htmlEncode(title)}</title>
  <meta charset="utf-8">
  <style>body{font-family:sans-serif;margin:0;padding:0}.prop{font-weight:bold}.null{color:red}.bool{color:blue}.num{color:blue}.string{color:green;white-space:pre-wrap}.collapser{position:absolute;left:-1em;top:-.2em;cursor:pointer;transform:rotate(90deg);transition:transform .2s}.collapser:before{content:"▸";-moz-user-select:none}.collapsible.collapsed{height:1.2em;width:1em;display:inline-block;overflow:hidden;vertical-align:top;margin:0}.collapsible.collapsed:before{content:"…";width:1em;margin-left:.2em}.collapser.collapsed{transform:rotate(0deg)}.q{display:inline-block;width:0;color:transparent}.quoted .q{display:inline;width:auto;color:inherit;font-weight:normal}li{position:relative}#error{border-bottom:1px solid #d4d1d1;background-color:#efefef;margin-bottom:1.5em;padding:1em .5em}.errormessage{font-family:monospace;margin-top:.5em;color:#a70505}.errorcolumn{background-color:#a70505;color:white}.errorline{background-color:#ffe2e2}#json{font-family:monospace;font-size:1.1em;white-space:pre-wrap;margin:.5em}ul{list-style:none;margin:0 0 0 2em;padding:0}h1{font-size:1.2em}.callback+#json{padding-left:1em}.callback{font-family:monospace;color:#a52a2a}
  </style>
  <script type="text/javascript">
  function collapse(evt){var collapser=evt.target;while(collapser&&(!collapser.classList||!collapser.classList.contains("collapser"))){collapser=collapser.nextSibling}if(!collapser||!collapser.classList||!collapser.classList.contains("collapser")){return}evt.stopPropagation();collapser.classList.toggle("collapsed");var collapsible=collapser;while(collapsible&&(!collapsible.classList||!collapsible.classList.contains("collapsible"))){collapsible=collapsible.nextSibling}collapsible.classList.toggle("collapsed")}function collapseAll(evt){var inputList;var i;if(evt.ctrlKey||evt.shiftKey||evt.altKey||evt.metaKey){return}if(evt.keyCode===37){inputList=document.querySelectorAll(".collapsible, .collapser");for(i=0;i<inputList.length;i++){if(inputList[i].parentNode.id!=="json"){inputList[i].classList.add("collapsed")}}evt.preventDefault()}else{if(evt.keyCode===39){inputList=document.querySelectorAll(".collapsed");for(i=0;i<inputList.length;i++){inputList[i].classList.remove("collapsed")}evt.preventDefault()}}}function bindOperation(){document.addEventListener("click",collapse,false);document.addEventListener("keyup",collapseAll,false)};</script>
  </head><body onload="bindOperation()">
  ${content}
  </body></html>`;
  }