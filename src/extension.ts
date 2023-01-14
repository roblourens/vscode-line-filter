import * as vscode from 'vscode';
import { doFilter } from './filter';

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(vscode.commands.registerCommand('vscode-line-filter.filterActiveEditor', () => doFilter()));
}

export function deactivate() {}
