import { IncomingMessage, ServerResponse } from 'node:http';
import { Socket } from 'node:net';

// Exercise the real Express middleware and routes without opening a network port.
export function injectApp(app, path, { method = 'GET', body, headers = {}, cookie } = {}) {
  return new Promise((resolve, reject) => {
    const socket = new Socket();
    const req = new IncomingMessage(socket);
    req.method = method; req.url = path;
    const raw = body === undefined ? '' : JSON.stringify(body);
    req.headers = { host: 'farminix.test', 'content-type': 'application/json', ...(raw ? { 'content-length': String(Buffer.byteLength(raw)) } : {}), ...(cookie ? { cookie } : {}), ...headers };
    const res = new ServerResponse(req), chunks = [];
    const timeout = setTimeout(() => { socket.destroy(); reject(new Error(`Request timed out: ${method} ${path}`)); }, 10000);
    res.write = chunk => { if (chunk) chunks.push(Buffer.from(chunk)); return true; };
    res.end = chunk => {
      if (chunk) chunks.push(Buffer.from(chunk));
      clearTimeout(timeout); res.emit('finish'); socket.destroy();
      const text = Buffer.concat(chunks).toString(); let json;
      try { json = JSON.parse(text); } catch { json = text; }
      resolve({ status: res.statusCode, body: json, headers: res.getHeaders(), cookie: res.getHeader('set-cookie') });
      return res;
    };
    app.handle(req, res, error => { clearTimeout(timeout); socket.destroy(); reject(error || new Error(`No route: ${path}`)); });
    req.push(raw || null); if (raw) req.push(null);
  });
}
