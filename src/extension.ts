import * as vscode from 'vscode';
import { RedHatAuthenticationService, onDidChangeSessions } from './authentication-service';
import { getAuthConfig, getMASAuthConfig } from './common/configuration';
import { getTelemetryService, TelemetryService } from "@redhat-developer/vscode-redhat-telemetry";


export async function activate(context: vscode.ExtensionContext) {
	const config = await getAuthConfig();
	const masConfig = await getMASAuthConfig();
	
	const loginService = await RedHatAuthenticationService.build(context, config);
	const telemetryService: TelemetryService = await getTelemetryService("redhat.vscode-redhat-account");

	context.subscriptions.push(loginService);

	context.subscriptions.push(vscode.commands.registerCommand('redhat.account.status', async () => {
		try {
			return vscode.authentication.getSession(config.serviceId, ['openid']).then(async session => {
				if (session) {
					vscode.window.showInformationMessage(`You're logged in Red Hat as ${session?.account.label}`);
				} else {
					vscode.window.showWarningMessage(`You need to log in your Red Hat account`);
				}
			});
		} catch (error) {
			console.log('Error in redhat.account.status:', error);
			vscode.window.showErrorMessage(error);
		}
	}));
	context.subscriptions.push(vscode.commands.registerCommand('redhat.mas.account.status', async () => {
		try {
			return vscode.authentication.getSession(masConfig.serviceId, ['openid'], { createIfNone: true }).then(async session => {
				if (session) {
					vscode.window.showInformationMessage(`You're logged in Red Hat MAS as ${session?.account.label}`);
				} else {
					vscode.window.showWarningMessage(`You need to log in your Red Hat MAS account`);
				}
			});
		} catch (error) {
			console.log('Error in redhat.mas.account.status:', error);
			vscode.window.showErrorMessage(error);
		}
	}));

	await loginService.initialize();

	context.subscriptions.push(vscode.authentication.registerAuthenticationProvider(config.serviceId,
		'Red Hat', {
		onDidChangeSessions: onDidChangeSessions.event,
		getSessions: (scopes: string[]) => loginService.getSessions(scopes),
		createSession: async (scopes: string[]) => {
			try {
				telemetryService.send({ name: 'login' });
				const session = await loginService.createSession(scopes.sort().join(' '));
				onDidChangeSessions.fire({ added: [session], removed: [], changed: [] });
				return session;
			} catch (error) {
				telemetryService.send({ name: 'login_failed' });
				throw error;
			}
		},
		removeSession: async (id: string) => {
			try {
				telemetryService.send({ name: 'logout' });
				const session = await loginService.removeSession(id);
				if (session) {
					onDidChangeSessions.fire({ added: [], removed: [session], changed: [] });
				}
			} catch (error) {
				telemetryService.send({ name: 'logout_failed' });
				throw error;
			}
		}
	}
	));

	const masLoginService = await RedHatAuthenticationService.build(context, masConfig);
	await masLoginService.initialize();
	context.subscriptions.push(masLoginService);

	context.subscriptions.push(vscode.authentication.registerAuthenticationProvider(masConfig.serviceId,
		'Red Hat Managed Services', {
		onDidChangeSessions: onDidChangeSessions.event,
		getSessions: (scopes: string[]) => masLoginService.getSessions(scopes),
		createSession: async (scopes: string[]) => {
			try {
				telemetryService.send({ name: 'login_mas' });
				const session = await masLoginService.createSession(scopes.sort().join(' '));
				onDidChangeSessions.fire({ added: [session], removed: [], changed: [] });
				return session;
			} catch (error) {
				telemetryService.send({ name: 'login_mas_failed', properties: { error: error } });
				throw error;
			}
		},
		removeSession: async (id: string) => {
			try {
				telemetryService.send({ name: 'logout_mas' });
				const session = await masLoginService.removeSession(id);
				if (session) {
					onDidChangeSessions.fire({ added: [], removed: [session], changed: [] });
				}
			} catch (error) {
				telemetryService.send({ name: 'logout_mas_failed', properties: { error: error } });
				throw error;
			}
		}
	}
	));


	telemetryService.sendStartupEvent();

	return;
}