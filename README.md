[![Visual Studio Marketplace](https://img.shields.io/visual-studio-marketplace/v/redhat.vscode-redhat-account?style=for-the-badge&label=VS%20Marketplace&logo=visual-studio-code)](https://marketplace.visualstudio.com/items?itemName=redhat.vscode-redhat-account)


# Red Hat Authentication

Provides authentication support for Red Hat accounts in Visual Studio Code.

- Authenticate against https://sso.redhat.com/ with the `redhat-account-auth` authentication provider
```typescript
const session = await authentication.getSession('redhat-account-auth', ['openid'], { createIfNone: true });
if (session) {
	// use access token
	doSomething(session.accessToken);
}	
```

## Testing

An interactive test scenario is available. It requires a user account and it will rely on the local web browser. You can run it with:

```shell
npm run interactive-test
```

## Build

`vscode-redhat-account` supports Node 18 or greater.

In a terminal, run:
```
npm install
npx vsce package
```

Install the generated vscode-redhat-account-*.vsix file.

## Telemetry

With your approval, the `Red Hat Authentication` extension collects anonymous [usage data](USAGE_DATA.md) and sends it to Red Hat servers to help improve our products and services.
Read our [privacy statement](https://developers.redhat.com/article/tool-data-collection) to learn more.
This extension respects the `redhat.telemetry.enabled` setting, which you can learn more about at https://github.com/redhat-developer/vscode-redhat-telemetry#how-to-disable-telemetry-reporting


## CI Builds
- Go to the [CI Workflow](https://github.com/redhat-developer/vscode-redhat-account/actions/workflows/CI.yml?query=branch%3Amain+is%3Asuccess++) page, 
- Click on the latest successful build
- Download and unzip the latest vscode-redhat-account artifact
- Install the vscode-redhat-account-*.vsix file.

## License
Copyright (c) Red Hat, Inc. All rights reserved.

Licensed under the [MIT](LICENSE.txt) license.
