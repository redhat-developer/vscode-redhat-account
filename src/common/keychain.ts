/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as vscode from 'vscode';
import Logger from './logger';
import { REDHAT_AUTH_SERVICE_ID } from './constants';

export class Keychain {
	async setToken(token: string): Promise<void> {
		try {
			return await vscode.authentication.setPassword(REDHAT_AUTH_SERVICE_ID, token);
		} catch (e) {
			// Ignore
			Logger.error(`Setting Red Hat token failed: ${e}`);
			const troubleshooting = "Troubleshooting Guide";
			const result = await vscode.window.showErrorMessage(`Writing login information to the keychain failed with error '${e.message}'.`, troubleshooting);
			if (result === troubleshooting) {
				vscode.env.openExternal(vscode.Uri.parse('https://code.visualstudio.com/docs/editor/settings-sync#_troubleshooting-keychain-issues'));
			}
		}
	}

	async getToken(): Promise<string | null | undefined> {
		try {
			return await vscode.authentication.getPassword(REDHAT_AUTH_SERVICE_ID);
		} catch (e) {
			// Ignore
			Logger.error(`Getting Red Hat token failed: ${e}`);
			return Promise.resolve(undefined);
		}
	}

	async deleteToken(): Promise<void> {
		try {
			return await vscode.authentication.deletePassword(REDHAT_AUTH_SERVICE_ID);
		} catch (e) {
			// Ignore
			Logger.error(`Deleting Red Hat token failed: ${e}`);
			return Promise.resolve(undefined);
		}
	}
}

export const keychain = new Keychain();