import * as assert from 'assert';

import * as vscode from 'vscode';
import  {RedHatAuthenticationProvider}  from "../../redhat-auth-provider";

suite('Authentication Provider test suite', () => {

	test('create provider instance ', async () => {
        const provider = await RedHatAuthenticationProvider.build();
        assert.strictEqual(provider.id,"redhat-account-auth");
    });
    
});
