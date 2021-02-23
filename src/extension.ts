import * as vscode from 'vscode';
import * as request from 'request-promise';
import { RedHatAuthenticationService, onDidChangeSessions } from './authentication-service';
import { StagingConfig, StagingMasConfig } from './common/configuration';
import { getTelemetryService, TelemetryService } from "@redhat-developer/vscode-redhat-telemetry";

const config = StagingConfig;
const masConfig = StagingMasConfig;

export async function activate(context: vscode.ExtensionContext) {
	const loginService = await RedHatAuthenticationService.build(context, config);
	const telemetryService: TelemetryService = await getTelemetryService("redhat.vscode-redhat-account");

	context.subscriptions.push(loginService);

	context.subscriptions.push(vscode.commands.registerCommand('redhat.account.status', async () => {
		return vscode.authentication.getSession(config.serviceId, ['openid']).then(async session => {
			if (session) {
				vscode.window.showInformationMessage(`You're logged in as ${session?.account.label}`);
				const server = await getKafkaServer(session.accessToken);
				vscode.window.showInformationMessage(`Your Kafka Cluster: ${server}`);
			} else {
				vscode.window.showWarningMessage(`You need to log in your Red Hat account`);
			}
		});
	}));
	context.subscriptions.push(vscode.commands.registerCommand('redhat.mas.account.status', async () => {
		return vscode.authentication.getSession(masConfig.serviceId, ['openid']).then(async session => {
			if (session) {
				vscode.window.showInformationMessage(`You're logged in as ${session?.account.label}`);
				vscode.window.showInformationMessage(`Your MAS access token: ${session.accessToken}`);
			} else {
				vscode.window.showWarningMessage(`You need to log in your Red Hat MAS account`);
			}
		});
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
	}));
	
	const masLoginService = await RedHatAuthenticationService.build(context, config);
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
				telemetryService.send({ name: 'login_mas_failed' });
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
				telemetryService.send({ name: 'logout_mas_failed' });
				throw error;
			}
		}
	}));
	
	
	telemetryService.sendStartupEvent();

	return;
}
async function getKafkaServer(token: string): Promise<string|null> {
	const options: request.OptionsWithUri = {
		port: 443,
		uri: `${config.apiUrl}/api/managed-services-api/v1/kafkas`,
		headers: {
			'Authorization': `Bearer ${token}`,
			'Accept': 'application/json'
		}
	  }
	  try {
		const response =  await request(options);
		const kafkas = JSON.parse(response);
		return kafkas.items[0].bootstrapServerHost;
	  } catch (err) {
		console.log(err);
		throw err;
	  }
}

