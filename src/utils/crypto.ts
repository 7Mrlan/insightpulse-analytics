// src/utils/crypto.ts
import type { AxiosRequestConfig } from 'axios';

// 时间窗口常量（单位：毫秒）
const TIMESTAMP_TOLERANCE = 5 * 60 * 1000; // 5 分钟，需与后端一致

interface SecureSignatureConfig extends AxiosRequestConfig {
  nonce: string; // 必须由调用方生成并传入
  timestamp: number; // 必须由调用方生成并传入
}

// 强化密钥处理（使用 Base64 编码的环境变量）
const SECRET_KEY = Uint8Array.from(atob(import.meta.env.VITE_AES_BASE64_KEY), c => c.charCodeAt(0));

/**
 * AES-GCM 加密（Base64 编码输出）
 */
export async function encryptToken(data: string): Promise<string> {
  try {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await crypto.subtle.importKey('raw', SECRET_KEY, { name: 'AES-GCM' }, false, [
      'encrypt',
    ]);

    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      new TextEncoder().encode(data)
    );

    // 合并 IV 和密文后转 Base64
    const buffer = new Uint8Array([...iv, ...new Uint8Array(encrypted)]);
    return btoa(String.fromCharCode(...buffer));
  } catch (error) {
    throw new Error(`加密失败: ${(error as Error).message}`);
  }
}

/**
 * 生成高强度随机数（Base64 编码）
 */
export function generateNonce(length: number = 16): string {
  // 导出给调用方使用
  const array = crypto.getRandomValues(new Uint8Array(length));
  return btoa(String.fromCharCode(...array));
}

/**
 * 强化版 HMAC 签名
 */
export async function generateSecureSignature(
  config: SecureSignatureConfig, // 强制要求传入 nonce 和 timestamp
  secretKey: string
): Promise<string> {
  // 参数校验
  if (!secretKey) throw new Error('API 签名密钥未提供');
  if (!config.nonce) throw new Error('缺少防重放随机数');
  if (!config.timestamp) throw new Error('缺少时间戳');

  // 时间窗口校验（基于传入的 timestamp）
  if (Math.abs(Date.now() - config.timestamp) > TIMESTAMP_TOLERANCE) {
    throw new Error('请求已过期');
  }

  // 构建签名载荷（直接使用传入参数）
  const payload = {
    method: config.method?.toUpperCase() || 'GET',
    path: config.url || '',
    data: sortObjectKeys(config.data),
    timestamp: config.timestamp, // 直接使用传入值
    nonce: config.nonce, // 直接使用传入值
  };

  // 生成规范化消息
  const message = Object.entries(payload)
    .map(([k, v]) => `${k}=${JSON.stringify(v)}`)
    .join('&');

  // 生成 HMAC
  return generateHMAC(new TextEncoder().encode(secretKey), message);
}

// 以下保持不变 ▼▼▼
async function generateHMAC(secretKey: Uint8Array, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    secretKey,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message));
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

function sortObjectKeys(obj: any): any {
  if (typeof obj !== 'object' || obj === null) return obj;
  if (Array.isArray(obj)) return obj.map(sortObjectKeys);
  return Object.keys(obj)
    .sort()
    .reduce((sorted: Record<string, any>, key) => {
      sorted[key] = sortObjectKeys(obj[key]);
      return sorted;
    }, {});
}
