// src/utils/keyManager.ts
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
    // 如果缓存的密钥有效并且版本一致，直接返回缓存
    if (
      this.cache[type]?.version === version &&
      Date.now() - this.cache[type].timestamp < this.KEY_REFRESH_INTERVAL
    ) {
      return this.cache[type].key;
    }

    // 密钥缓存机制
    if (this.refreshing) {
      return new Promise<CryptoKey>(resolve => {
        this.pendingRequests.push(() => resolve(this.getKey(type, version)));
      });
    }

    this.refreshing = true;
    try {
      const key = await this.fetchKey(type, version); // 获取密钥
      this.cache[type] = { key, timestamp: Date.now(), version };
      this.pendingRequests.forEach(callback => callback()); // 执行所有等待的请求
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
    const response = await fetch(`/api/keys/${type}?version=${version}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${type} key: ${response.statusText}`);
    }
    const keyBase64 = await response.text();
    return await this.importKey(keyBase64, type); // 解析密钥
  }

  private static async importKey(
    base64: string,
    type: 'encryption' | 'signature'
  ): Promise<CryptoKey> {
    const keyArray = Uint8Array.from(atob(base64), c => c.charCodeAt(0)); // 将 Base64 解码为字节数组
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
