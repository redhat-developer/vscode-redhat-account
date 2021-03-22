import { getCheServerConfig } from "../che/cheServerConfig";
import { ServerConfig } from "./serverConfig";

export interface AuthConfig {
    serviceId: string,
    authUrl: string,
    apiUrl: string,
    clientId: string,
    serverConfig: ServerConfig;
}
export const SSO_REDHAT = 'sso-redhat';
export const MAS_SSO_REDHAT = 'mas-sso-redhat';
export type AuthType = 'sso-redhat' | 'mas-sso-redhat';

export async function getAuthConfig(): Promise<AuthConfig> {
    // return {
    //     serviceId: 'redhat-account-auth',
    //     authUrl : 'https://sso.redhat.com/auth/realms/redhat-external',
    //     apiUrl: 'https://api.openshift.com',
    //     clientId: 'vscode-redhat-account',
    //     serverConfig: await getServerConfig(SSO_REDHAT)
    // };

    return {
        serviceId: 'redhat-account-auth',
        authUrl: 'https://sso.redhat.com/auth/realms/redhat-external',
        apiUrl: 'https://api.stage.openshift.com',
        clientId: 'vscode-redhat-account',
        serverConfig: await getServerConfig(SSO_REDHAT)
    };
}
export async function getMASAuthConfig(): Promise<AuthConfig> {
    // return {
    //     serviceId: 'redhat-mas-account-auth',
    //     authUrl: 'http://identity.api.openshift.com/auth/realms/rhoas/',
    //     apiUrl: 'https://api.openshift.com',
    //     clientId: 'vscode-redhat-account',
    //     serverConfig: await getServerConfig(MAS_SSO_REDHAT)
    // };
    return {
        serviceId: 'redhat-mas-account-auth',
        authUrl: 'https://keycloak-mas-sso-stage.apps.app-sre-stage-0.k3s7.p1.openshiftapps.com/auth/realms/rhoas/',
        apiUrl: 'https://api.stage.openshift.com',
        clientId: 'vscode-redhat-account',
        serverConfig: await getServerConfig(MAS_SSO_REDHAT)
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