import * as vscode from 'vscode';

export interface IFilterConfiguration {
    includes: string[];
    excludes: string[];
}

/**
 * Load the includes and excludes config files from .vscode
 */
export async function getConfig(folder: vscode.WorkspaceFolder): Promise<IFilterConfiguration> {
    const includesPath = vscode.Uri.joinPath(folder.uri, '.vscode', 'line-filter-includes.json');
    const excludesPath = vscode.Uri.joinPath(folder.uri, '.vscode', 'line-filter-excludes.json');
    const includes = await getPatternsFromFile(includesPath);
    const excludes = await getPatternsFromFile(excludesPath);
    return { includes, excludes };
}

async function getPatternsFromFile(filePath: vscode.Uri): Promise<string[]> {
    let fileText: string;
    try {
        fileText = (await vscode.workspace.fs.readFile(filePath)).toString();
    } catch (err) {
        // Doesn't exist
        return [];
    }

    try {
        return JSON.parse(fileText);
    } catch (err) {
        // Invalid JSON
        console.error(`Invalid JSON in ${filePath.fsPath}: ${err}`);
        return [];
    }
}