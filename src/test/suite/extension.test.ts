import * as assert from 'assert';
import * as vscode from 'vscode';
import { REDHAT_AUTH_SERVICE_ID} from '../../common/constants'

suite('Extension Test Suite', () => {

	test('activation test', async () => {
		await vscode.extensions.getExtension('redhat.vscode-redhat-account')?.activate()
		// const providers = vscode.authentication.providers.filter( p => p.id === REDHAT_AUTH_SERVICE_ID);
		// assert.strictEqual(1, providers.length);
		// assert.strictEqual('Red Hat', providers[0].label);
	});
});
