import * as path from 'path';
import * as cp from 'child_process';

import {
	downloadAndUnzipVSCode,
	resolveCliPathFromVSCodeExecutablePath,
	runTests
} from '@vscode/test-electron';

async function main() {
	try {
		const vscodeExecutablePath = await downloadAndUnzipVSCode();
		const cliPath = resolveCliPathFromVSCodeExecutablePath(vscodeExecutablePath);

		// Use cp.spawn / cp.exec for custom setup
		// cp.spawnSync(cliPath, ['--install-extension', 'some-extension'], {
		// 	encoding: 'utf-8',
		// 	stdio: 'inherit'
		// });

		// The folder containing the Extension Manifest package.json
		// Passed to `--extensionDevelopmentPath`
		const extensionDevelopmentPath = path.resolve(__dirname, '../../');

		// The path to the extension test script
		// Passed to --extensionTestsPath
		const extensionTestsPath = path.resolve(__dirname, './suite/index');

		// Download VS Code, unzip it and run the integration test
		await runTests({ extensionDevelopmentPath, extensionTestsPath });
	} catch (err) {
		console.error(err);
		console.error('Failed to run tests');
		process.exit(1);
	}
}

main();
