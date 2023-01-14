import * as vscode from 'vscode';

export interface IFilterConfiguration {
    includes?: string[];
    excludes?: string[];
}

export interface IFilterConfigurationSet {
    [key: string]: IFilterConfiguration;
}

/**
 * Load the includes and excludes config files from .vscode
 */
export async function getConfig(workspaceFolder: vscode.WorkspaceFolder): Promise<IFilterConfigurationSet> {
    const patterns = vscode.workspace.getConfiguration('lineFilter', workspaceFolder).get('patterns', {});
    return patterns;
}
