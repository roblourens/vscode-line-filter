import * as vscode from 'vscode';
import { doFilter } from './filter';

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(vscode.commands.registerCommand('vscode-line-filter.filterActiveEditor', () => doFilter()));
	context.subscriptions.push(vscode.commands.registerCommand('vscode-line-filter.filterActiveEditorInPlace', () => doFilter(true)));
}

export function deactivate() {}
