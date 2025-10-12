import http from 'http';
// import { log } from './vite'; // Removed for production

export class HTTPRedirectServer {
  static createRedirectServer(httpsPort: number, httpPort: number = 80) {
    const redirectServer = http.createServer((req, res) => {
      const host = req.headers.host?.split(':')[0] || 'localhost';
      const redirectUrl = `https://${host}:${httpsPort}${req.url}`;
      
      res.writeHead(301, {
        'Location': redirectUrl,
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload'
      });
      res.end();
    });
    
    redirectServer.listen(httpPort, () => {
          console.log(`🔄 HTTP redirect server running on port ${httpPort}`);
    console.log('✅ All HTTP traffic redirected to HTTPS');
    });
    
    return redirectServer;
  }
}
