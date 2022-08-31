import * as assert from 'assert';
import * as path from 'path';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import * as myExtension from '../../extension';

suite('Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');
	vscode.window.showOpenDialog().then((uri) => {
		console.log("uri=", uri);
		const currentPanel = vscode.window.createWebviewPanel(
			'ccjsonviewer', // Identifies the type of the webview. Used internally
			"Json Viewer", // Title of the panel displayed to the user
			vscode.ViewColumn.One, // Editor column to show the new webview panel in.
			{ 
				enableScripts: true,
				localResourceRoots: [
				  vscode.Uri.file(path.join('../../../../', 'media'))
				]
			} // Webview options. More on these later.
		);
		const editor = vscode.window.activeTextEditor!;
		// And set its HTML content
		currentPanel.webview.html = myExtension.jsonToHTML(editor.document.getText(), editor.document.uri.toString(), '../../../../', currentPanel.webview);
	});

	test('Sample test', () => {
		assert.strictEqual([1, 2, 3].indexOf(5), -1);
		assert.strictEqual([1, 2, 3].indexOf(0), -1);
	});
	
});