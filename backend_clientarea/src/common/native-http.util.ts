import * as http from 'http';
import * as https from 'https';
import { URL } from 'url';

export type NativeHttpResponse = {
  statusCode: number;
  headers: http.IncomingHttpHeaders;
  body: string;
};

/**
 * HTTP/HTTPS tanpa `fetch` — kompatibel Node 16+ tanpa ExperimentalWarning.
 */
export function nativeHttpRequest(
  urlString: string,
  options: {
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    headers?: Record<string, string>;
    body?: string;
  },
): Promise<NativeHttpResponse> {
  const u = new URL(urlString);
  const isHttps = u.protocol === 'https:';
  const mod = isHttps ? https : http;
  const defaultPort = isHttps ? 443 : 80;
  const port = u.port ? parseInt(u.port, 10) : defaultPort;
  const pathWithQuery = `${u.pathname}${u.search}`;
  const bodyStr = options.body ?? '';
  const hdrs: Record<string, string> = { ...(options.headers || {}) };
  if (bodyStr && hdrs['Content-Length'] === undefined) {
    hdrs['Content-Length'] = String(Buffer.byteLength(bodyStr, 'utf8'));
  }

  return new Promise((resolve, reject) => {
    const req = mod.request(
      {
        hostname: u.hostname,
        port,
        path: pathWithQuery,
        method: options.method,
        headers: hdrs,
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on('data', (c: Buffer) => chunks.push(c));
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode ?? 0,
            headers: res.headers,
            body: Buffer.concat(chunks).toString('utf8'),
          });
        });
      },
    );
    req.on('error', reject);
    if (bodyStr) req.write(bodyStr, 'utf8');
    req.end();
  });
}

export function getHeader(
  headers: http.IncomingHttpHeaders,
  name: string,
): string {
  const v = headers[name.toLowerCase()] ?? headers[name];
  if (v == null) return '';
  return Array.isArray(v) ? v[0] : v;
}
