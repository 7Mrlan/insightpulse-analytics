// src/utils/keyManager.ts
import { handleError } from './logger'; // 引入统一错误处理
import { fetchKey } from '@/apis/modules/key.api'; // 引入 API 模块
import { retryOperation } from './utils'; // 引入通用重试函数

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
    // 检查缓存，避免重复请求
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
      const key = await this.fetchKeyWithRetry(type, version); // 使用重试机制获取密钥
      this.cache[type] = { key, timestamp: Date.now(), version };
      await Promise.all(this.pendingRequests.map(callback => callback())); // 执行所有等待的请求
      this.pendingRequests = [];
    } finally {
      this.refreshing = false;
    }

    return this.cache[type].key;
  }

  // 使用重试机制获取密钥
  private static async fetchKeyWithRetry(
    type: 'encryption' | 'signature',
    version: string
  ): Promise<CryptoKey> {
    return await retryOperation(() => this.fetchKey(type, version), 3); // 重试3次
  }

  // 获取密钥的方法，支持版本控制
  private static async fetchKey(
    type: 'encryption' | 'signature',
    version: string
  ): Promise<CryptoKey> {
    try {
      const { masterKey, salt } = await fetchKey(type, version); // 后端返回主密钥和盐
      return await this.deriveKey(masterKey, salt, type); // 派生加密密钥
    } catch (error: unknown) {
      handleError(() => {
        throw new Error(`Failed to fetch ${type} key: ${(error as Error).message}`);
      }, 'Key Fetch Error');
      throw new Error('Key fetch failed');
    }
  }

  // 派生密钥：根据主密钥和盐派生出加密或签名密钥
  private static async deriveKey(
    masterKeyBase64: string,
    saltBase64: string,
    type: 'encryption' | 'signature'
  ): Promise<CryptoKey> {
    // 解码 base64 编码的主密钥和盐
    const masterKeyArray = Uint8Array.from(atob(masterKeyBase64), c => c.charCodeAt(0)); // base64 解码
    const saltArray = Uint8Array.from(atob(saltBase64), c => c.charCodeAt(0)); // 解码盐值

    // 使用 HKDF 来派生密钥
    const algorithm = {
      name: 'HMAC',
      hash: 'SHA-256',
    };

    // 提取阶段：使用 HMAC 对基础密钥和盐值进行提取
    const baseKey = await crypto.subtle.importKey(
      'raw',
      masterKeyArray,
      algorithm,
      false,
      ['sign'] // 用于生成 HMAC 密钥
    );

    // 扩展阶段：派生出多个密钥（一个用于 AES，一个用于 HMAC）
    const derivedKeys = await crypto.subtle.deriveKey(
      {
        name: 'HMAC',
        hash: 'SHA-256',
        salt: saltArray,
        iterations: 100000, // 增加迭代次数，增加安全性
      },
      baseKey,
      { name: type === 'encryption' ? 'AES-GCM' : 'HMAC', length: 256 },
      false,
      type === 'encryption' ? ['encrypt', 'decrypt'] : ['sign', 'verify']
    );

    return derivedKeys;
  }

  // 清空敏感数据
  static clearSensitiveData(buffer: Uint8Array) {
    buffer.fill(0); // 清除数据
  }
}

export default KeyManager;
