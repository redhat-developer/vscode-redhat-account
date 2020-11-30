import * as vscode from 'vscode';
import { RedHatAuthenticationProvider } from './redhat-auth-provider';

export async function activate(context: vscode.ExtensionContext) {
	const loginService = await RedHatAuthenticationProvider.build();
	context.subscriptions.push(vscode.authentication.registerAuthenticationProvider(loginService));
	context.subscriptions.push(vscode.commands.registerCommand('redhat.account.status', () => {
		return vscode.authentication.getSession(loginService.id, ['managed_service']);
	}));
}
