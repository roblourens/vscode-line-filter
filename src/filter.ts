import * as vscode from 'vscode';
import { getConfig, IFilterConfiguration } from './configuration';

export async function doFilter(inPlace = false): Promise<void> {
    if (!vscode.window.activeTextEditor) {
        return;
    }

    const doc = vscode.window.activeTextEditor.document;
    const lines = doc.getText().split('\n');
    const workspaceFolder = vscode.workspace.getWorkspaceFolder(doc.uri) ?? vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
        return;
    }

    const config = await getSelectedConfig(workspaceFolder);
    if (!config) {
        return;
    }

    const newLines = lines
        .filter(line => !config.includes || config.includes.some(g => line.includes(g)))
        .filter(line => !config.excludes?.some(g => line.includes(g)));

    if  (inPlace) {
        const edit = new vscode.WorkspaceEdit();
        edit.replace(doc.uri, new vscode.Range(0, 0, doc.lineCount, 0), newLines.join('\n'));
        vscode.workspace.applyEdit(edit);
    } else {
        const newDoc = await vscode.workspace.openTextDocument({ content: newLines.join('\n'), language: doc.languageId });
        await vscode.window.showTextDocument(newDoc);
    }
}

async function getSelectedConfig(workspaceFolder: vscode.WorkspaceFolder): Promise<IFilterConfiguration | undefined> {
    const config = await getConfig(workspaceFolder);
    const configKeys = Object.keys(config);
    if (configKeys.length > 1) {
        const selection = await vscode.window.showQuickPick(configKeys, { placeHolder: 'Select a filter set' });
        if (!selection) {
            return;
        }

        return config[selection];
    } else {
        return config[configKeys[0]];
    }
}
