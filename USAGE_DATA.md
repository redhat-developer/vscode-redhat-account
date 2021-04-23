# Data collection

`Red Hat Authentication` has opt-in telemetry collection, provided by [`Red Hat Commons`](https://github.com/redhat-developer/vscode-commons).

## What's included in the `Red Hat Authentication` telemetry data

 * A telemetry event is sent every time you sign into Red Hat SSO
   - includes anonymized error message, in case of failure
 * A telemetry event is sent every time you log out of your Red Hat account
   - includes anonymized error message, in case of failure

## What's included in the general telemetry data

Please see the
[`Red Hat Commons` data collection information](https://github.com/redhat-developer/vscode-commons/blob/master/USAGE_DATA.md#other-extensions)
for information on what data it collects.

## How to opt in or out

Use the `redhat.telemetry.enabled` setting in order to enable or disable telemetry collection.