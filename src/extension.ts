import { getRedHatService, TelemetryService } from "@redhat-developer/vscode-redhat-telemetry";
import * as vscode from 'vscode';
import { onDidChangeSessions, RedHatAuthenticationService } from './authentication-service';
import { getAuthConfig } from './common/configuration';


export async function activate(context: vscode.ExtensionContext) {
	const config = await getAuthConfig();

	let loginService:RedHatAuthenticationService;
	const telemetryService: TelemetryService = await (await getRedHatService(context)).getTelemetryService();

	context.subscriptions.push(vscode.authentication.registerAuthenticationProvider(config.serviceId,
		'Red Hat', {
		onDidChangeSessions: onDidChangeSessions.event,
		getSessions: async (scopes: string[]) => {
			if (!loginService) {
				loginService = await RedHatAuthenticationService.build(context, config);
				context.subscriptions.push(loginService);
				await loginService.initialize();
			}
			return loginService.getSessions(scopes);
		},
		createSession: async (scopes: string[]) => {
			try {
				const session = await loginService.createSession(scopes.sort().join(' '));
				telemetryService.send({ name: 'account.login' });
				onDidChangeSessions.fire({ added: [session], removed: [], changed: [] });
				return session;
			} catch (error) {
				telemetryService.send({ name: 'account.login.failed', properties: { error: `${error}` } });
				throw error;
			}
		},
		removeSession: async (id: string) => {
			try {
				telemetryService.send({ name: 'account.logout' });
				const session = await loginService.removeSession(id);
				if (session) {
					onDidChangeSessions.fire({ added: [], removed: [session], changed: [] });
				}
			} catch (error) {
				telemetryService.send({ name: 'account.logout.failed', properties: { error: `${error}` } });
				throw error;
			}
		}
	}
	));

	telemetryService.sendStartupEvent();

	return;
}