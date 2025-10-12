import fs from 'fs';
import path from 'path';

export interface SSLConfig {
  enabled: boolean;
  certPath: string;
  keyPath: string;
  caPath?: string;
  redirectHTTP: boolean;
}

export class SSLService {
  private static getSSLConfig(): SSLConfig {
    const isProduction = process.env.NODE_ENV === 'production';
    
    if (!isProduction) {
      return {
        enabled: false,
        certPath: '',
        keyPath: '',
        redirectHTTP: false
      };
    }
    
    return {
      enabled: process.env.SSL_ENABLED === 'true',
      certPath: process.env.SSL_CERT_PATH || '/etc/ssl/certs/yourdomain.com.crt',
      keyPath: process.env.SSL_KEY_PATH || '/etc/ssl/private/yourdomain.com.key',
      caPath: process.env.SSL_CA_PATH,
      redirectHTTP: process.env.SSL_REDIRECT === 'true'
    };
  }

  static validateSSLConfig(): { valid: boolean; errors: string[] } {
    const config = this.getSSLConfig();
    const errors: string[] = [];
    
    if (!config.enabled) {
      return { valid: true, errors: [] };
    }
    
    // Check if certificate files exist
    if (!fs.existsSync(config.certPath)) {
      errors.push(`SSL certificate not found: ${config.certPath}`);
    }
    
    if (!fs.existsSync(config.keyPath)) {
      errors.push(`SSL private key not found: ${config.keyPath}`);
    }
    
    if (config.caPath && !fs.existsSync(config.caPath)) {
      errors.push(`SSL CA certificate not found: ${config.caPath}`);
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  static getSSLOptions() {
    const config = this.getSSLConfig();
    
    if (!config.enabled) {
      return null;
    }
    
    const sslOptions: any = {
      cert: fs.readFileSync(config.certPath),
      key: fs.readFileSync(config.keyPath),
      minVersion: 'TLSv1.2',
      maxVersion: 'TLSv1.3',
      ciphers: 'TLS_AES_128_GCM_SHA256:TLS_AES_256_GCM_SHA384',
      honorCipherOrder: true
    };
    
    if (config.caPath) {
      sslOptions.ca = fs.readFileSync(config.caPath);
    }
    
    return sslOptions;
  }
}
