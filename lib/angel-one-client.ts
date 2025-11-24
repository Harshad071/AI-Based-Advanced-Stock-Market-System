import crypto from 'crypto';
import WebSocket from 'ws';

interface AngelOneConfig {
  clientId: string;
  secretKey: string;
  apiKey: string;
  baseUrl?: string;
}

interface LoginResponse {
  status: string;
  data?: {
    authToken: string;
    refreshToken: string;
    feedToken: string;
  };
  message?: string;
}

interface QuoteResponse {
  status: string;
  data?: {
    fetched: Array<{
      symbol: string;
      name: string;
      exchange: string;
      token: string;
      exch_token: string;
      instrumenttype: string;
      price: number;
      open: number;
      high: number;
      low: number;
      close: number;
      bid: number;
      ask: number;
      bid_qty: number;
      ask_qty: number;
      volume: number;
      lastupdate: number;
    }>;
  };
  message?: string;
}

class AngelOneClient {
  private clientId: string;
  private secretKey: string;
  private apiKey: string;
  private baseUrl: string;
  private authToken: string | null = null;
  private feedToken: string | null = null;

  constructor(config: AngelOneConfig) {
    this.clientId = config.clientId;
    this.secretKey = config.secretKey;
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || 'https://api.angel-broking.com/rest/secure';
  }

  private generateTotp(): string {
    const secret = this.secretKey;
    const buffer = Buffer.from(secret, 'utf-8');
    const epoch = Math.floor(Date.now() / 1000 / 30);
    
    const hmac = crypto.createHmac('sha1', buffer);
    hmac.update(Buffer.from([
      0, 0, 0, 0,
      (epoch >> 24) & 0xff,
      (epoch >> 16) & 0xff,
      (epoch >> 8) & 0xff,
      epoch & 0xff,
    ]));
    
    const digest = hmac.digest();
    const offset = digest[digest.length - 1] & 0xf;
    const code = (
      ((digest[offset] & 0x7f) << 24) |
      ((digest[offset + 1] & 0xff) << 16) |
      ((digest[offset + 2] & 0xff) << 8) |
      (digest[offset + 3] & 0xff)
    ) % 1000000;
    
    return code.toString().padStart(6, '0');
  }

  async login(): Promise<boolean> {
    try {
      const totp = this.generateTotp();
      
      const payload = {
        clientcode: this.clientId,
        password: this.secretKey,
        totp: totp,
      };

      const response = await fetch(`${this.baseUrl}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-UserType': 'USER',
          'X-SourceID': 'WEB',
          'X-ClientLocalIP': '127.0.0.1',
          'X-ClientPublicIP': '127.0.0.1',
          'X-MACAddress': '00:00:00:00:00:00',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const text = await response.text();
        console.error('[v0] Angel One login HTTP error:', response.status, text.substring(0, 200));
        return false;
      }

      let data: LoginResponse;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error('[v0] Angel One login response parse error:', parseError);
        return false;
      }
      
      if (data.status === 'SUCCESS' && data.data) {
        this.authToken = data.data.authToken;
        this.feedToken = data.data.feedToken;
        console.log('[v0] Angel One login successful');
        return true;
      } else {
        console.error('[v0] Angel One login failed:', data.message);
        return false;
      }
    } catch (error) {
      console.error('[v0] Angel One login error:', error);
      return false;
    }
  }

  async getQuotes(symbols: string[]): Promise<QuoteResponse> {
    if (!this.authToken) {
      await this.login();
    }

    try {
      const payload = {
        mode: 'FULL',
        exchangetokens: JSON.stringify({
          NSE: symbols.map(s => `${s}-EQ`),
        }),
      };

      const response = await fetch(`${this.baseUrl}/quote/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.authToken}`,
          'X-UserType': 'USER',
          'X-SourceID': 'WEB',
          'X-ClientLocalIP': '127.0.0.1',
          'X-ClientPublicIP': '127.0.0.1',
          'X-MACAddress': '00:00:00:00:00:00',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const text = await response.text();
        console.error('[v0] Angel One quote HTTP error:', response.status, text.substring(0, 200));
        return { status: 'FAIL', message: `HTTP ${response.status}` };
      }

      try {
        const data: QuoteResponse = await response.json();
        return data;
      } catch (parseError) {
        console.error('[v0] Angel One quote response parse error:', parseError);
        return { status: 'FAIL', message: 'Invalid JSON response' };
      }
    } catch (error) {
      console.error('[v0] Error fetching quotes:', error);
      return { status: 'FAIL', message: 'Failed to fetch quotes' };
    }
  }

  async getOptionChain(symbol: string, expiryDate: string): Promise<any> {
    if (!this.authToken) {
      await this.login();
    }

    try {
      const payload = {
        mode: 'FULL',
        exchangetokens: JSON.stringify({
          NFO: [`${symbol}${expiryDate}-EQ`],
        }),
      };

      const response = await fetch(`${this.baseUrl}/quote/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.authToken}`,
          'X-UserType': 'USER',
          'X-SourceID': 'WEB',
          'X-ClientLocalIP': '127.0.0.1',
          'X-ClientPublicIP': '127.0.0.1',
          'X-MACAddress': '00:00:00:00:00:00',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      return await response.json();
    } catch (error) {
      console.error('[v0] Error fetching option chain:', error);
      return null;
    }
  }

  streamRealtimeData(
    symbols: string[],
    onData: (data: any) => void,
    onError: (error: any) => void
  ) {
    try {
      const ws = new WebSocket(`wss://liveapi.angelbroking.com/`);

      ws.onopen = () => {
        console.log('[v0] WebSocket connected to Angel One');
        
        // Subscribe to symbols
        const subscribePayload = {
          action: 'subscribe',
          params: {
            mode: 'full',
            tokennum: symbols.map(s => `${s}-EQ`),
          },
        };
        
        ws.send(JSON.stringify(subscribePayload));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          onData(data);
        } catch (error) {
          console.error('[v0] Error parsing WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('[v0] WebSocket error:', error);
        onError(error);
      };

      ws.onclose = () => {
        console.log('[v0] WebSocket disconnected');
      };

      return ws;
    } catch (error) {
      console.error('[v0] Error creating WebSocket:', error);
      onError(error);
      return null;
    }
  }

  getAuthToken(): string | null {
    return this.authToken;
  }

  getFeedToken(): string | null {
    return this.feedToken;
  }
}

// Create singleton instance
let clientInstance: AngelOneClient | null = null;

export function initializeAngelOneClient(): AngelOneClient {
  if (!clientInstance) {
    const apiKey = process.env.ANGEL_ONE_API_KEY || 'KhGM3jf9';
    const clientId = process.env.ANGEL_ONE_CLIENT_ID || 'AAAA463045';
    const secretKey = process.env.ANGEL_ONE_SECRET_KEY || '1ca6d841-8825-4e30-a4be-662e8594b7ef';

    clientInstance = new AngelOneClient({
      clientId,
      secretKey,
      apiKey,
    });
  }
  return clientInstance;
}

export { AngelOneClient };
