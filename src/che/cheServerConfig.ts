/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-prototype-builtins */
// if you use the import only as a type, the compiler will not emit a "require" at the top level.
import * as che from '@eclipse-che/plugin';
import { AuthType } from '../common/configuration';
import { ServerConfig } from "../common/serverConfig";

export async function getCheServerConfig(type: AuthType): Promise<ServerConfig> {
  const endpointName = type;
  const cheAPI: typeof che = require('@eclipse-che/plugin');
  if (cheAPI.endpoint) {
    // new API 
    const endpoints = await cheAPI.endpoint.getEndpointsByName(endpointName);
    if (endpoints && endpoints.length === 1) {
      const endpoint = endpoints[0];
      return {
        callbackPath: type + '-callback',
        externalUrl: endpoint.url!,
        port: (endpoint.attributes) ? Number(endpoint.attributes['targetPort']) : undefined
      };
    }
  }

  // Fallback to using old API
  const workspace = await cheAPI.workspace.getCurrentWorkspace();

  if (!workspace.runtime) {
    throw new Error('Workspace is not running.');
  }

  const machines = workspace.runtime.machines!;
  for (const machineName in machines) {
    if (!machines.hasOwnProperty(machineName)) {
      continue;
    }
    const servers = machines[machineName].servers!;
    for (const serverName in servers) {
      if (!servers.hasOwnProperty(serverName)) {
        continue;
      }
      if (endpointName === serverName) {
        const server = servers[serverName];
        return {
          callbackPath: type + '-callback',
          externalUrl: server.url!,
          port: (server.attributes) ? Number(server.attributes['port']) : undefined
        };
      }
    }
  }
  throw new Error(`No Che endpoint found for '${endpointName}'`);
}