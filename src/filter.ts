import * as vscode from 'vscode';
import { getConfig } from './configuration';

export async function doFilter(): Promise<void> {
    if (!vscode.window.activeTextEditor) {
        return;
    }

    const doc = vscode.window.activeTextEditor.document;
    const lines = doc.getText().split('\n');
    const workspaceFolder = vscode.workspace.getWorkspaceFolder(doc.uri) ?? vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
        return;
    }

    const config = await getConfig(workspaceFolder);
    const newLines = lines
        .filter(line => config.includes.some(g => line.includes(g)))
        .filter(line => !config.excludes.some(g => line.includes(g)));
    const newDoc = await vscode.workspace.openTextDocument({ content: newLines.join('\n'), language: doc.languageId });
    await vscode.window.showTextDocument(newDoc);
}