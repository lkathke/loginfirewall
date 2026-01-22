import axios, { AxiosInstance } from 'axios';

const ZORAXY_API_URL = process.env.ZORAXY_API_URL;
const ZORAXY_USERNAME = process.env.ZORAXY_USERNAME;
const ZORAXY_PASSWORD = process.env.ZORAXY_PASSWORD;

if (!ZORAXY_API_URL || !ZORAXY_USERNAME || !ZORAXY_PASSWORD) {
    console.warn("Zoraxy API URL, Username or Password not configured in .env");
}

class ZoraxyClient {
    private client: AxiosInstance;
    private sessionCookie: string | null = null;
    private csrfToken: string | null = null;
    private csrfCookieToken: string | null = null;
    private loginPromise: Promise<void> | null = null;
    private cookies: Record<string, string> = {};

    constructor() {
        this.client = axios.create({
            baseURL: ZORAXY_API_URL,
            withCredentials: true,
        });
    }

    private resetSession() {
        this.sessionCookie = null;
        this.csrfToken = null;
        this.csrfCookieToken = null;
        this.loginPromise = null;
        this.cookies = {};
    }

    debugState() {
        return {
            csrfToken: this.csrfToken,
            csrfCookieToken: this.csrfCookieToken,
            sessionCookie: this.sessionCookie,
            cookies: { ...this.cookies },
        };
    }

    private buildCookieHeader(): string {
        return Object.entries(this.cookies)
            .map(([key, value]) => `${key}=${value}`)
            .join('; ');
    }

    private updateCookies(setCookieHeaders?: string[]) {
        if (!setCookieHeaders || setCookieHeaders.length === 0) {
            return;
        }

        setCookieHeaders.forEach((cookieStr: string) => {
            const [pair] = cookieStr.split(';');
            const [name, ...valueParts] = pair.split('=');
            if (!name || valueParts.length === 0) return;

            const cookieName = name.trim();
            const cookieValue = valueParts.join('=');
            this.cookies[cookieName] = cookieValue;

            if (cookieName === 'zoraxy_csrf') {
                this.csrfCookieToken = cookieValue;
            }
        });

        const cookieHeader = this.buildCookieHeader();
        if (cookieHeader) {
            this.sessionCookie = cookieHeader;
        }

        console.log('=== ZORAXY: Stored cookies:', Object.keys(this.cookies));
        console.log('=== ZORAXY: Cookie jar values:', this.cookies);
        if (this.csrfCookieToken) {
            console.log('=== ZORAXY: CSRF cookie token:', this.csrfCookieToken);
        }
    }

    private extractCsrfFromMeta(html: string): string | null {
        const match = html.match(/name=["']zoraxy\.csrf\.Token["']\s+content=["']([^"']+)["']/i);
        return match?.[1] || null;
    }

    private async getInitialCsrfToken(): Promise<void> {
        try {
            console.log('=== ZORAXY: Fetching initial CSRF token ===');
            const response = await this.client.get('/login.html', {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Accept': 'text/html',
                    'Accept-Language': 'de-DE,de;q=0.9',
                }
            });

            const cookies = response.headers['set-cookie'];
            console.log('=== ZORAXY: Received cookies:', cookies ? cookies.length : 0);

            if (cookies && cookies.length > 0) {
                this.updateCookies(cookies as string[]);
            } else {
                console.warn('=== ZORAXY: No cookies returned on initial request');
            }

            const metaToken = this.extractCsrfFromMeta(response.data || '');
            if (metaToken) {
                this.csrfToken = metaToken;
                console.log('=== ZORAXY: CSRF token from meta:', metaToken);
            } else if (this.csrfCookieToken) {
                this.csrfToken = this.csrfCookieToken;
                console.log('=== ZORAXY: CSRF token from cookie fallback:', this.csrfToken);
            } else {
                console.warn('=== ZORAXY: No CSRF token found in meta or cookies');
            }
        } catch (error: any) {
            console.error('=== ZORAXY: Error getting CSRF token:', error.message);
            throw error;
        }
    }

    private async login(): Promise<void> {
        if (this.loginPromise) {
            return this.loginPromise;
        }

        this.loginPromise = (async () => {
            try {
                await this.getInitialCsrfToken();

                if (!this.csrfToken) {
                    throw new Error('Failed to get CSRF token');
                }

                console.log('=== ZORAXY: Logging in... ===');
                const params = new URLSearchParams();
                params.append('username', ZORAXY_USERNAME!);
                params.append('password', ZORAXY_PASSWORD!);
                params.append('rmbme', 'false');

                console.log('=== ZORAXY: Login request headers ===', {
                    Cookie: this.buildCookieHeader(),
                    'x-csrf-token': this.csrfToken,
                });

                const response = await this.client.post('/api/auth/login', params, {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                        'Cookie': this.buildCookieHeader(),
                        'x-csrf-token': this.csrfToken,
                        'x-requested-with': 'XMLHttpRequest',
                        'Accept': '*/*',
                        'Referer': `${ZORAXY_API_URL}/login.html`,
                    },
                });

                const cookies = response.headers['set-cookie'];
                this.updateCookies(cookies as string[] | undefined);

                console.log('=== ZORAXY: Successfully logged in! ===');
            } catch (error: any) {
                console.error('=== ZORAXY: Login error ===');
                console.error('Status:', error.response?.status);
                console.error('Data:', error.response?.data);
                console.error('Message:', error.message);
                console.error('=== ZORAXY: Debug state on error ===', this.debugState());
                this.resetSession();
                throw error;
            }
        })();

        return this.loginPromise;
    }

    private async ensureAuthenticated(): Promise<void> {
        if (!this.sessionCookie || !this.csrfToken) {
            await this.login();
        }
    }

    async addToWhitelist(whitelistId: string, ip: string, comment: string = 'Added via LoginFirewall - 24h access'): Promise<any> {
        try {
            await this.ensureAuthenticated();

            const params = new URLSearchParams();
            params.append('ip', ip);
            params.append('comment', comment);
            params.append('id', whitelistId);

            const response = await this.client.post('/api/whitelist/ip/add', params, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    'Cookie': this.buildCookieHeader(),
                    'x-csrf-token': this.csrfToken || '',
                    'x-requested-with': 'XMLHttpRequest',
                }
            });

            console.log(`Successfully added IP ${ip} to whitelist ${whitelistId}`);
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 401 || error.response?.status === 403) {
                this.resetSession();
                await this.ensureAuthenticated();

                const params = new URLSearchParams();
                params.append('ip', ip);
                params.append('comment', comment);
                params.append('id', whitelistId);

                const response = await this.client.post('/api/whitelist/ip/add', params, {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                        'Cookie': this.buildCookieHeader(),
                        'x-csrf-token': this.csrfToken || '',
                        'x-requested-with': 'XMLHttpRequest',
                    }
                });

                return response.data;
            }

            console.error('Error adding IP to Zoraxy whitelist:', error);
            throw error;
        }
    }

    async removeFromWhitelist(whitelistId: string, ip: string): Promise<any> {
        try {
            await this.ensureAuthenticated();

            const params = new URLSearchParams();
            params.append('ip', ip);
            params.append('id', whitelistId);

            const response = await this.client.post('/api/whitelist/ip/remove', params, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    'Cookie': this.buildCookieHeader(),
                    'x-csrf-token': this.csrfToken || '',
                    'x-requested-with': 'XMLHttpRequest',
                }
            });

            console.log(`Successfully removed IP ${ip} from whitelist ${whitelistId}`);
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 401 || error.response?.status === 403) {
                this.resetSession();
                await this.ensureAuthenticated();

                const params = new URLSearchParams();
                params.append('ip', ip);
                params.append('id', whitelistId);

                const response = await this.client.post('/api/whitelist/ip/remove', params, {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                        'Cookie': this.buildCookieHeader(),
                        'x-csrf-token': this.csrfToken || '',
                        'x-requested-with': 'XMLHttpRequest',
                    }
                });

                return response.data;
            }

            console.error('Error removing IP from Zoraxy whitelist:', error);
            throw error;
        }
    }
}

export const ZoraxyService = new ZoraxyClient();
