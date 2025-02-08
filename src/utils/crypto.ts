import md5 from 'md5';
import type { AxiosRequestConfig } from 'axios';

interface SignatureConfig extends AxiosRequestConfig {
  data?: any;
  path?: string;
}

/**
 * Generates API request signature
 * @param config Request configuration
 * @returns MD5 hash signature
 * @throws Error if API secret is not configured
 */
export function generateSignature(config: SignatureConfig): string {
  const timestamp = Date.now();
  const secret = import.meta.env.VITE_API_SECRET;

  if (!secret) {
    throw new Error('API_SECRET is not configured in environment variables');
  }

  try {
    const payload = {
      timestamp,
      path: config.path || config.url,
      data: config.data || {}
    };

    return md5(`${timestamp}${secret}${JSON.stringify(payload)}`);
  } catch (error) {
    console.error('Failed to generate signature:', error);
    throw new Error('Failed to generate request signature');
  }
}
