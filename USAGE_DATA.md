# Data collection

`Red Hat Authentication` has opt-in telemetry collection, provided by [`vscode-redhat-telemetry`](https://github.com/redhat-developer/vscode-redhat-telemetry).

## What's included in the `Red Hat Authentication` telemetry data

 * A telemetry event is sent every time you sign into Red Hat SSO
   - includes anonymized error message, in case of failure
 * A telemetry event is sent every time you log out of your Red Hat account
   - includes anonymized error message, in case of failure

## What's included in the general telemetry data

Please see the
[`vscode-redhat-telemetry` data collection information](https://github.com/redhat-developer/vscode-redhat-telemetry/blob/HEAD/USAGE_DATA.md)
for information on what data it collects.

## How to opt in or out

Use the `redhat.telemetry.enabled` setting in order to enable or disable telemetry collection.