# Change Log

All notable changes to the `Red Hat Authentication` extension will be documented in this file.

## 0.2.0 (04/04/2024)
- Add support for Device code flow, when running in a browser
- Minimum Node version is now Node 18
- Upgrade axios from 0.8.1 to 0.27 (GHSA-wf5p-g6vw-rhxx)
- Upgrade to redhat-developer/vscode-redhat-telemetry to 0.7.1 (GHSA-wf5p-g6vw-rhxx)
- Replace vscode-test with @vscode/test-electron

## 0.1.0 (23/01/2023)
- Fixed Extension failing to get activated in disconnected environment  ([#2](https://github.com/redhat-developer/vscode-redhat-account/issues/22))
- Update vscode-redhat-telemetry to 0.5.2
- Update openid-client to 5.3.0

## 0.0.7 (25/11/2022)
- Fixes running in WSL2 ([#18](https://github.com/redhat-developer/vscode-redhat-account/issues/18))
- Update vscode-redhat-telemetry to 0.5.2
- Update openid-client to 5.3.0

## 0.0.6 (13/07/2022)
- Remove MAS SSO provider ([#17](https://github.com/redhat-developer/vscode-redhat-account/pull/17))

## 0.0.5 (05/07/2022)
- Add DCO Documentation ([#16](https://github.com/redhat-developer/vscode-redhat-account/pull/16))
- Prepare MAS SSO Shutdown ([#15](https://github.com/redhat-developer/vscode-redhat-account/pull/15))
- Compile against Node 14 ([#14](https://github.com/redhat-developer/vscode-redhat-account/pull/14))

## 0.0.4 (22/09/2021)
- Remove web extension kind ([#13](https://github.com/redhat-developer/vscode-redhat-account/pull/13))
- Update vscode-redhat-telemetry to 0.4.2

## 0.0.3 (14/06/2021)
- Remove dependency to vscode-commons ([#12](https://github.com/redhat-developer/vscode-redhat-account/pull/12))
- Add idToken property to AuthenticationSession instance ([#11](https://github.com/redhat-developer/vscode-redhat-account/pull/11))
- Update dependencies

## 0.0.2 (23/04/2021)

- Distinguish the SSO callback pages (`Red Hat` vs `Red Hat OpenShift Application Services`)

## 0.0.1 (23/04/2021)

- Initial release
