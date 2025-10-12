import https from 'https';
import { Express } from 'express';
import { SSLService } from './ssl';
// import { log } from './vite'; // Removed for production

export class HTTPSServer {
  static createHTTPS(app: Express, port: number) {
    const sslOptions = SSLService.getSSLOptions();
    
    if (!sslOptions) {
      console.log('SSL not enabled, skipping HTTPS server creation');
      return null;
    }
    
    const httpsServer = https.createServer(sslOptions, app);
    
    httpsServer.listen(port, () => {
          console.log(`🔒 HTTPS server running on port ${port}`);
    console.log('✅ SSL/TLS enabled with secure configuration');
    });
    
    return httpsServer;
  }
}
