import * as vscode from 'vscode';
import { RedHatAuthenticationService, onDidChangeSessions } from './autthentication-service';
import { REDHAT_AUTH_SERVICE_ID } from './common/constants';

export async function activate(context: vscode.ExtensionContext) {
	const loginService = await RedHatAuthenticationService.build();
	context.subscriptions.push(loginService);

	context.subscriptions.push(vscode.commands.registerCommand('redhat.account.status', () => {
		return vscode.authentication.getSession(REDHAT_AUTH_SERVICE_ID, ['managed_service']).then(session => {
			if (session) {
				vscode.window.showInformationMessage(`You're logged in as ${session?.account.label}`);
			} else {
				vscode.window.showWarningMessage(`You need to log in your Red Hat account`);
			}
		})
	}));

	await loginService.initialize();

	context.subscriptions.push(vscode.authentication.registerAuthenticationProvider({
		id: REDHAT_AUTH_SERVICE_ID,
		label: 'Red Hat',
		supportsMultipleAccounts: true,
		onDidChangeSessions: onDidChangeSessions.event,
		getSessions: () => Promise.resolve(loginService.sessions),
		login: async (scopes: string[]) => {
			const session = await loginService.login(scopes.sort());
			onDidChangeSessions.fire({ added: [session.id], removed: [], changed: [] });
			return session;
		},
		logout: async (id: string) => {
			await loginService.logout(id);
			onDidChangeSessions.fire({ added: [], removed: [id], changed: [] });
		}
	}));
	return;
}
