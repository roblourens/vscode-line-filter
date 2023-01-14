import * as vscode from 'vscode';

export interface IFilterConfiguration {
    name: string;
    includes?: string[];
    excludes?: string[];
}

export type IFilterConfigurationSet = IFilterConfiguration[];

interface IRawFilterConfiguration {
    name: string;
    includes?: string[];
    excludes?: string[];
}

interface IRawFilterConfigurationSet {
    [key: string]: IRawFilterConfiguration;
}

/**
 * Load the includes and excludes config files from .vscode
 */
export async function getConfig(workspaceFolder: vscode.WorkspaceFolder): Promise<IFilterConfigurationSet> {
    const patterns: IRawFilterConfigurationSet = vscode.workspace.getConfiguration('lineFilter', workspaceFolder).get('patterns', {});
    return Object.keys(patterns).map(key => {
        const pattern = patterns[key];
        return {
            name: key,
            includes: pattern.includes,
            excludes: pattern.excludes
        };
    });
}
