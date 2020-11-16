import * as http from 'http';
import * as url from 'url';

interface Deferred<T> {
	resolve: (result: T | Promise<T>) => void;
	reject: (reason: any) => void;
}

interface ISessionInfo {
	id: string;
	refreshToken: string;
	account: {
		label?: string;
		displayName?: string,
		id: string
	}
}

export function createServer(nonce: string) {

    type RedirectResult = { req: http.IncomingMessage; res: http.ServerResponse; } | { err: any, res: http.ServerResponse };
	let deferredRedirect: Deferred<RedirectResult>;
	const redirectPromise = new Promise<RedirectResult>((resolve, reject) => deferredRedirect = { resolve, reject });

	let deferredCallback: Deferred<RedirectResult>;
	const callbackPromise = new Promise<RedirectResult>((resolve, reject) => deferredCallback = { resolve, reject });



    const server = http.createServer(function (req, res) {
		const reqUrl = url.parse(req.url!, /* parseQueryString */ true);
		switch (reqUrl.pathname) {
            case '/signin':
				// eslint-disable-next-line no-case-declarations
				const receivedNonce = ((reqUrl.query.nonce as string) || '').replace(/ /g, '+');
				if (receivedNonce === nonce) {
					deferredRedirect.resolve({ req, res });
				} else {
					const err = new Error('Nonce does not match.');
					deferredRedirect.resolve({ err, res });
				}
				break;
			case '/callback':
                deferredCallback.resolve({ req, res });
				break;
			default:
				res.writeHead(404);
				res.end();
				break;
		}
    });
    return {server, redirectPromise, callbackPromise};


}

export async function startServer(server: http.Server): Promise<string> {
	let portTimer: NodeJS.Timer;

	function cancelPortTimer() {
		clearTimeout(portTimer);
	}

	const port = new Promise<string>((resolve, reject) => {
		portTimer = setTimeout(() => {
			reject(new Error('Timeout waiting for port'));
		}, 5000);

		server.on('listening', () => {
            const address = server.address();
            if (typeof (address) === 'undefined' || address === null) {
                reject(new Error('adress is null or undefined'));
            }else 
			if (typeof address === 'string') {
				resolve(address);
			} else {
				resolve(address.port.toString());
			}
		});

		server.on('error', _ => {
			reject(new Error('Error listening to server'));
		});

		server.on('close', () => {
			reject(new Error('Closed'));
		});

		server.listen(0);
	});

	port.then(cancelPortTimer, cancelPortTimer);
	return port;
}