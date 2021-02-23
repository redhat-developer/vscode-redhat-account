export interface AuthConfig {
    serviceId: string,
    authUrl: string,
    apiUrl: string,
    callbackPath: string,
    clientId: string,
}

export const ProductionConfig: AuthConfig = {
    serviceId: 'redhat-account-auth',
    authUrl : 'https://sso.redhat.com/auth/realms/redhat-external',
    apiUrl: 'https://api.openshift.com',
    callbackPath: 'sso-redhat-callback',
    clientId: 'rhoas-cli-prod'
}

// export const StagingConfig: AuthConfig = {
//    serviceId: 'redhat-account-auth',
//     authUrl : 'https://sso.stage.redhat.com/auth/realms/redhat-external',
//     apiUrl: 'https://api.stage.openshift.com',
//     callbackPath: 'sso-redhat-callback',
//     clientId: 'vscode-redhat-account'
// }

export const StagingConfig: AuthConfig = {
    serviceId: 'redhat-account-auth',
    authUrl : 'https://sso.redhat.com/auth/realms/redhat-external',
    apiUrl: 'https://api.stage.openshift.com',
    callbackPath: 'sso-redhat-callback',
    clientId: 'rhoas-cli-prod'
}

export const StagingMasConfig: AuthConfig = {
    serviceId: 'redhat-mas-account-auth',
    authUrl : 'https://keycloak-edge-redhat-rhoam-user-sso.apps.mas-sso-stage.1gzl.s1.devshift.org/auth/realms/mas-sso-staging/protocol/openid-connect/auth',
    apiUrl: 'https://api.stage.openshift.com',
    callbackPath: 'mas-sso-redhat-callback',
    clientId: 'vscode-redhat-auth'
}
