import * as vscode from 'vscode';
import { RedHatAuthenticationProvider } from './redhat-auth-provider';



export async function activate(context: vscode.ExtensionContext) {
	const loginService = await RedHatAuthenticationProvider.build();
	context.subscriptions.push(vscode.authentication.registerAuthenticationProvider(loginService));
	
	const disposable = vscode.commands.registerCommand('redhat.account.login', () => {
		vscode.authentication.getSession(loginService.id,['managed_service'], {createIfNone: true});
	});

	context.subscriptions.push(disposable);
}
