import { ServerConfig } from "./serverConfig";

export interface AuthConfig {
    serviceId: string,
    authUrl: string,
    apiUrl: string,
    clientId: string,
    serverConfig: ServerConfig;
}
export const SSO_REDHAT = 'sso-redhat';
export type AuthType = 'sso-redhat';
const REDHAT_AUTH_URL = process.env.REDHAT_SSO_URL ? process.env.REDHAT_SSO_URL : 'https://sso.redhat.com/auth/realms/redhat-external/';
const KAS_API_URL = process.env.KAS_API_URL ? process.env.KAS_API_URL : 'https://api.openshift.com';
const CLIENT_ID = process.env.CLIENT_ID ? process.env.CLIENT_ID : 'vscode-redhat-account';

console.log("REDHAT_AUTH_URL: " + REDHAT_AUTH_URL);
console.log("KAS_API_URL: " + KAS_API_URL);
console.log("CLIENT_ID: " + KAS_API_URL);
export async function getAuthConfig(): Promise<AuthConfig> {
    return {
        serviceId: 'redhat-account-auth',
        authUrl: REDHAT_AUTH_URL,
        apiUrl: KAS_API_URL,
        clientId: CLIENT_ID,
        serverConfig: await getServerConfig(SSO_REDHAT)
    };
}

export async function getServerConfig(type: AuthType): Promise<ServerConfig> {
    // if (process.env['CHE_WORKSPACE_ID']) {
    //     return getCheServerConfig(type);
    // }
    return getLocalServerConfig(type);
}

async function getLocalServerConfig(type: AuthType): Promise<ServerConfig> {
    return {
        callbackPath: `${type}-callback`,
        externalUrl: 'http://localhost'
    };
}