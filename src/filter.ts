import * as vscode from 'vscode';
import { getConfig, IFilterConfiguration } from './configuration';

let asyncQ = Promise.resolve();
export async function doFilterAndWatch(): Promise<void> {
    if (!vscode.window.activeTextEditor) {
        return;
    }

    const doc = vscode.window.activeTextEditor.document;
    if (doc.uri.scheme !== 'output') {
        vscode.window.showErrorMessage('Filter and Watch is only supported for output channels');
        return;
    }

    const workspaceFolder = vscode.workspace.getWorkspaceFolder(doc.uri) ?? vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
        return;
    }

    const config = await getSelectedConfig(workspaceFolder);
    if (!config) {
        return;
    }

    const lines = doc.getText().split('\n');
    const newLines = applyConfigToLines(lines, config);

    // Reverse engineering this format from vscode, it could change.
    // Example: 'extension-output-ms-toolsai.jupyter-#1-Jupyter'
    // const outputChannelName = doc.uri.path.match(/.*-#.*-(.*)/)?.[1] ?? `Filtered`;
    // const outputChannel = vscode.window.createOutputChannel(`${outputChannelName} (${config.name})`, doc.languageId);
    // outputChannel.appendLine(newLines.join('\n'));
    // outputChannel.show();
    const newDoc = await vscode.workspace.openTextDocument({ content: newLines.join('\n') + '\n', language: doc.languageId });
    await vscode.window.showTextDocument(newDoc);

    const listener = vscode.workspace.onDidChangeTextDocument(e => {
        if (e.document.uri.toString() !== doc.uri.toString()) {
            return;
        }

        for (const change of e.contentChanges) {
            const editedLines = change.text.split('\n');
            const newLines = applyConfigToLines(editedLines, config);
            if (newLines.length) {
                // outputChannel.appendLine(newLines.join('\n'));
                asyncQ = asyncQ.then(async () => {
                    const edit = new vscode.WorkspaceEdit();
                    edit.insert(newDoc.uri, new vscode.Position(newDoc.lineCount, 0), newLines.join('\n') + '\n');
                    const result = await vscode.workspace.applyEdit(edit);
                    if (!result) {
                        vscode.window.showWarningMessage('Failed to apply edit, filtered log may be incomplete');
                    }
                });
            }
        }
    });

    const closeDocListener = vscode.workspace.onDidCloseTextDocument(e => {
        if (e.uri.toString() === newDoc.uri.toString() || e.uri.toString() === doc.uri.toString()) {
            if (e.uri.toString() === doc.uri.toString()) {
                vscode.window.showWarningMessage('The watched document has been closed- stopping watch');
            }

            listener.dispose();
            closeDocListener.dispose();
        }
    });
}

function applyConfigToLines(lines: string[], config: IFilterConfiguration): string[] {
    return lines
        .filter(line => !config.includes || config.includes.some(g => line.includes(g)))
        .filter(line => !config.excludes?.some(g => line.includes(g)));
}

export async function doFilter(inPlace = false): Promise<void> {
    if (!vscode.window.activeTextEditor) {
        return;
    }

    const doc = vscode.window.activeTextEditor.document;
    const workspaceFolder = vscode.workspace.getWorkspaceFolder(doc.uri) ?? vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
        return;
    }

    const config = await getSelectedConfig(workspaceFolder);
    if (!config) {
        return;
    }

    const lines = doc.getText().split('\n');
    const newLines = applyConfigToLines(lines, config);

    if (inPlace) {
        const edit = new vscode.WorkspaceEdit();
        edit.replace(doc.uri, new vscode.Range(0, 0, doc.lineCount, 0), newLines.join('\n'));
        vscode.workspace.applyEdit(edit);
    } else {
        const newDoc = await vscode.workspace.openTextDocument({ content: newLines.join('\n'), language: doc.languageId });
        await vscode.window.showTextDocument(newDoc);
    }
}

async function getSelectedConfig(workspaceFolder: vscode.WorkspaceFolder): Promise<IFilterConfiguration | undefined> {
    const configs = await getConfig(workspaceFolder);
    if (configs.length > 1) {
        const configKeys = configs.map(c => c.name);
        const selection = await vscode.window.showQuickPick(configKeys, { placeHolder: 'Select a filter set' });
        if (!selection) {
            return;
        }

        return configs.find(c => c.name === selection);
    } else {
        return configs[0];
    }
}
