import * as assert from 'assert';
import * as vscode from 'vscode';

suite('Extension Test Suite', () => {

	test('activation test', async () => {
		await vscode.extensions.getExtension('redhat.vscode-redhat-account')?.activate();
		const existingSession = await vscode.authentication.getSession('redhat-account-auth', ['openid'], { createIfNone: true });
		if (existingSession !== undefined) {
			console.log("Go on https://sso.redhat.com/auth/realms/redhat-external/account/#/applications and remove the vscode-redhat-account application");
			assert.ok(false);
		}
		console.log("Please: Click 'CANCEL'");
		try {
			const refusedSession = await vscode.authentication.getSession('redhat-account-auth', ['openid'], { createIfNone: true });
			assert.equal(refusedSession, undefined);
		} catch (error){
			//pass
		} finally {
			await new Promise(resolve => setTimeout(resolve, 1000));
		}

		console.log("Please: 'Grant Accept'");
		const acceptedSession = await vscode.authentication.getSession('redhat-account-auth', ['openid'], { createIfNone: true });
		assert.ok("id" in acceptedSession['account']);
		await new Promise(resolve => setTimeout(resolve, 60000));

		const activeSession = await vscode.authentication.getSession('redhat-account-auth', ['openid'], { createIfNone: false });
		assert.ok(activeSession && "id" in activeSession['account']);
	});
});
