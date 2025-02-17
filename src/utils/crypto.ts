// src/utils/crypto.ts
import { fastBase64Decode, encodeText, decodeText } from './utils'; // 引入工具函数
import KeyManager from './keyManager'; // 引入 KeyManager 进行密钥管理
import { handleError } from './logger'; // 错误处理

class CryptoError extends Error {
  readonly code: string;
  constructor(message: string, code = 'CRYPTO_ERROR') {
    super(message);
    this.code = code;
  }
}

export interface SecureSignatureConfig {
  method?: string;
  url?: string;
  data?: Record<string, unknown>;
  timestamp: number;
  nonce: string;
}

// 生成 IV
function generateIV(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(12)); // 返回 12 字节随机数
}

// 校验数据
function validateEncryptTokenData(data: string) {
  if (!data || typeof data !== 'string') {
    throw new Error('Data must be a non-empty string.');
  }
}

function validateDecryptTokenData(encryptedData: string) {
  if (!encryptedData || encryptedData.length <= 12) {
    throw new Error('Encrypted data is invalid.');
  }
}

function validateGenerateSignatureConfig(config: SecureSignatureConfig) {
  if (!config.nonce || !config.timestamp || !config.url) {
    throw new Error('Missing required fields in signature configuration.');
  }
}

// 加密
export async function encryptToken(data: string): Promise<string> {
  handleError(() => validateEncryptTokenData(data), 'Invalid input data for encryption.');

  try {
    const iv = generateIV(); // 生成 IV
    const key = await KeyManager.getKey('encryption'); // 使用 KeyManager 获取加密密钥
    const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encodeText(data)); // 加密数据

    const buffer = new Uint8Array(iv.length + encrypted.byteLength);
    buffer.set(iv);
    buffer.set(new Uint8Array(encrypted), iv.length);
    KeyManager.clearSensitiveData(new Uint8Array(encrypted)); // 使用 KeyManager 清除加密后的数据
    return btoa(String.fromCharCode(...buffer)); // 返回 Base64 编码的加密数据
  } catch (error) {
    throw new CryptoError('加密失败，请检查输入数据或联系支持团队');
  }
}

// 解密
export async function decryptToken(encryptedData: string): Promise<string> {
  handleError(() => validateDecryptTokenData(encryptedData), 'Invalid input data for decryption.');

  try {
    const dataBuffer = fastBase64Decode(encryptedData); // 解码 Base64 数据
    const iv = dataBuffer.slice(0, 12); // 获取 IV
    const ciphertext = dataBuffer.slice(12); // 获取密文

    const key = await KeyManager.getKey('encryption'); // 使用 KeyManager 获取加密密钥
    const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext); // 解密数据

    KeyManager.clearSensitiveData(new Uint8Array(ciphertext)); // 使用 KeyManager 清除解密后的密文
    return decodeText(decrypted); // 返回解密后的文本
  } catch (error) {
    throw new CryptoError('解密失败，请检查输入数据或联系支持团队');
  }
}

// 签名生成
export async function generateSecureSignature(config: SecureSignatureConfig): Promise<string> {
  handleError(() => validateGenerateSignatureConfig(config), 'Invalid signature configuration.');

  try {
    const payload = {
      method: config.method?.toUpperCase() || 'GET',
      path: config.url || '',
      data: config.data,
      timestamp: config.timestamp,
      nonce: config.nonce,
    };

    const message = Object.entries(payload)
      .map(([k, v]) => `${k}=${JSON.stringify(v)}`)
      .join('&');
    const key = await KeyManager.getKey('signature'); // 使用 KeyManager 获取签名密钥

    const signature = await crypto.subtle.sign('HMAC', key, encodeText(message)); // 生成签名
    const result = new Uint8Array(signature);
    return result.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), ''); // 返回十六进制签名
  } catch (error) {
    throw new CryptoError('签名生成失败，请检查输入数据或联系支持团队');
  }
}
