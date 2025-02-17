// src/utils/keyManager.ts
import { handleError } from './logger'; // 引入统一错误处理
import { fetchKey } from '@/apis/modules/key.api'; // 引入 API 模块

class KeyManager {
  private static KEY_REFRESH_INTERVAL = 3600_000; // 1小时轮换
  private static cache: Record<string, { key: CryptoKey; version: string; timestamp: number }> = {};
  private static refreshing = false;
  private static pendingRequests: Array<() => void> = [];

  // 获取密钥，支持版本控制
  static async getKey(
    type: 'encryption' | 'signature',
    version: string = 'v1'
  ): Promise<CryptoKey> {
    if (
      this.cache[type]?.version === version &&
      Date.now() - this.cache[type].timestamp < this.KEY_REFRESH_INTERVAL
    ) {
      return this.cache[type].key;
    }

    if (this.refreshing) {
      return new Promise<CryptoKey>(resolve => {
        this.pendingRequests.push(() => resolve(this.getKey(type, version)));
      });
    }

    this.refreshing = true;
    try {
      const key = await this.fetchKey(type, version);
      this.cache[type] = { key, timestamp: Date.now(), version };
      await Promise.all(this.pendingRequests.map(callback => callback())); // 执行所有等待的请求
      this.pendingRequests = [];
    } finally {
      this.refreshing = false;
    }

    return this.cache[type].key;
  }

  // 获取密钥的方法，支持版本控制
  private static async fetchKey(
    type: 'encryption' | 'signature',
    version: string
  ): Promise<CryptoKey> {
    try {
      const keyBase64 = await fetchKey(type, version); // 从 API 获取密钥
      return await this.importKey(keyBase64, type);
    } catch (error: unknown) {
      // 错误处理：检查 error 类型并抛出详细错误
      handleError(() => {
        throw new Error(`Failed to fetch ${type} key: ${(error as Error).message}`);
      }, 'Key Fetch Error');
      throw new Error('Key fetch failed');
    }
  }

  private static async importKey(
    base64: string,
    type: 'encryption' | 'signature'
  ): Promise<CryptoKey> {
    const keyArray = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyArray,
      type === 'encryption' ? { name: 'AES-GCM' } : { name: 'HMAC', hash: 'SHA-256' },
      false,
      type === 'encryption' ? ['encrypt', 'decrypt'] : ['sign', 'verify']
    );

    // 清空密钥信息
    this.clearSensitiveData(keyArray);
    return cryptoKey;
  }

  // 清空敏感数据
  static clearSensitiveData(buffer: Uint8Array) {
    buffer.fill(0); // 清除数据
  }
}

export default KeyManager;
