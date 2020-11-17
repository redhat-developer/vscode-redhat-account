import * as vscode from 'vscode';
import { Client, Issuer, generators, TokenSet } from 'openid-client';
import {createServer,startServer } from './authentication-server';

// const ISSUER_METADATA_URL ='https://sso.redhat.com/auth/realms/redhat-external/';
const ISSUER_METADATA_URL ='https://sso.prod-preview.openshift.io/auth/realms/toolchain-public/';
const CLIENT_ID = 'crt';

export class RedHatAuthenticationProvider implements vscode.AuthenticationProvider {
    public readonly id: string = "redhat-account-auth";
    readonly label = "Red Hat OpenShift Service Account";
    readonly supportsMultipleAccounts = false;
    private _onDidChangeSessions = new vscode.EventEmitter<vscode.AuthenticationProviderAuthenticationSessionsChangeEvent>();
    private tokens: TokenSet[] = [];
    private refreshTimers : Map<string, NodeJS.Timeout> = new Map<string, NodeJS.Timeout>();
    private client : Client;
    
    constructor(issuer: Issuer<Client>) {
        this.client = new issuer.Client({
            client_id: CLIENT_ID,
            response_types: ['code'],
            token_endpoint_auth_method: 'none' 
        });
    }

    public static async build(): Promise<RedHatAuthenticationProvider> {
        const issuer = await Issuer.discover(ISSUER_METADATA_URL);
        const provider = new RedHatAuthenticationProvider(issuer);
        await provider.restoreTokens();
        return provider;
    }

    public getSessions(): Promise<vscode.AuthenticationSession[]> {
        return Promise.resolve(this.tokens.map( token => this.convertToSession(token)));
    }

    public async login(scopes: string[]): Promise<vscode.AuthenticationSession> {
       
        const nonce = generators.nonce();
        const { server, redirectPromise, callbackPromise }  = createServer(nonce);
        const port = await startServer(server);
      
        vscode.env.openExternal(vscode.Uri.parse(`http://localhost:${port}/signin?nonce=${encodeURIComponent(nonce)}`));


        const redirectReq = await redirectPromise;
        if ('err' in redirectReq) {
            const { err, res } = redirectReq;
            res.writeHead(302, { Location: `/?error=${encodeURIComponent(err && err.message || 'Unknown error')}` });
            res.end();
            throw err;
        }
        const host = redirectReq.req.headers.host || '';
		const updatedPortStr = (/^[^:]+:(\d+)$/.exec(Array.isArray(host) ? host[0] : host) || [])[1];
        const updatedPort = updatedPortStr ? parseInt(updatedPortStr, 10) : port;
        const redirect_uri = `http://localhost:${updatedPort}/callback`;

        const code_verifier = generators.codeVerifier();
        const code_challenge = generators.codeChallenge(code_verifier);
        const authUrl = this.client.authorizationUrl({
            scope: 'openid',
            resource: 'https://api.openshift.com',
            code_challenge,
            code_challenge_method: 'S256',
            redirect_uri: redirect_uri, 
            nonce: nonce
        });
        await redirectReq.res.writeHead(302, { Location: authUrl });
        redirectReq.res.end();

        const callbackResult =  await callbackPromise;
        
        if('err' in callbackResult){
            callbackResult.res.writeHead(302, { Location: `/?error=${encodeURIComponent(callbackResult.err && callbackResult.err.message || 'Unknown error')}` });
            callbackResult.res.end();
            throw callbackResult.err;
        } 
        const token = await this.client.callback(redirect_uri, this.client.callbackParams(callbackResult.req), { code_verifier, nonce });
        this.addToken(token);
        await callbackResult.res.writeHead(302, { Location: '/' });
        callbackResult.res.end();
        return Promise.resolve(this.convertToSession(token));
    }

    public async logout(sessionId: string): Promise<void> {
        const tokenIndex = this.tokens.findIndex(token => token.sessionId === sessionId);
		if (tokenIndex > -1) {
			this.tokens.splice(tokenIndex, 1);
        }
        //Remove refresh timer if there is one  
        const timeout = this.refreshTimers.get(sessionId);
		if (timeout) {
			clearTimeout(timeout);
			this.refreshTimers.delete(sessionId);
        }
        vscode.authentication.setPassword(this.id, JSON.stringify(this.tokens));
        this._onDidChangeSessions.fire({ added: [], removed: [sessionId], changed: [] });
    }

    get onDidChangeSessions(): vscode.Event<vscode.AuthenticationProviderAuthenticationSessionsChangeEvent> {
        return this._onDidChangeSessions.event;
    }

    private addToken(token:TokenSet){
        if(!token || !token.session_state){
            return;
        }

        const tknIdx = this.tokens.findIndex( t => t.session_state === token.session_state);
        if (tknIdx > -1 ){
            this.tokens.splice(tknIdx, 1, token);
        }else{
            this.tokens.push(token);
        }

        const timeout = this.refreshTimers.get(token.session_state);
		if (timeout) {
			clearTimeout(timeout);
			this.refreshTimers.delete(token.session_state);
		}

        if (token.expires_in) {
			this.refreshTimers.set(token.session_state, setTimeout(async () => {
				try {
                    await this.refreshToken(token);
				} catch (e) {
                    //
				}
			}, 1000 * (token.expires_in - 30)));
        }
        vscode.authentication.setPassword(this.id, JSON.stringify(this.tokens));
    }

    private async refreshToken(token: TokenSet) {
        try {
            const refreshedToken = await this.client.refresh(token);
            this.addToken(refreshedToken);
            this._onDidChangeSessions.fire({ added: [], removed: [], changed: [token.session_state!] });
        } catch (error) {
            // logout from session to remove
            await this.logout(token.session_state!);
        }
    }

    private async restoreTokens(){
        const storedTokens = await vscode.authentication.getPassword(this.id);
        if( storedTokens ){
            const tokens:TokenSet[] = JSON.parse(storedTokens);
            const refreshPromises = tokens.map( token => {
                return this.refreshToken(token);
            });
            await Promise.all(refreshPromises);
        }
    }

    private convertToSession(token:TokenSet) : vscode.AuthenticationSession{
        const claims = token.claims();
        return {
            id:  token.session_state!, 
            accessToken: token.access_token!,
            account: {
                label: claims.email || claims.preferred_username || 'user',
                id: claims.sub
            },
            scopes: []
        };
    }
}
