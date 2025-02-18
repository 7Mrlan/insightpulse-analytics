// src/utils/utils.ts

// Base64 解码函数
export function fastBase64Decode(base64: string): Uint8Array {
  const binary = atob(base64); // 将 Base64 解码为二进制字符串
  return Uint8Array.from(binary, char => char.charCodeAt(0)); // 转换为 Uint8Array
}

// 编码函数（TextEncoder）
export function encodeText(text: string): Uint8Array {
  return new TextEncoder().encode(text); // 使用 TextEncoder 编码文本为 Uint8Array
}

// 解码函数（TextDecoder）
export function decodeText(buffer: Uint8Array): string {
  return new TextDecoder().decode(buffer); // 使用 TextDecoder 解码为字符串
}

// src/utils/utils.ts
export async function retryOperation<T>(operation: () => Promise<T>, retries: number): Promise<T> {
  let attempts = 0;
  while (attempts < retries) {
    try {
      return await operation();
    } catch (error) {
      attempts++;
      if (attempts >= retries) {
        throw new Error(`Operation failed after ${retries} attempts: ${error}`);
      }
      // 使用指数退避，最大延迟1秒
      const delay = Math.min(1000, 50 * Math.pow(2, attempts));  // 上限1秒
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error("Max retries reached without success");  // 如果超过最大重试次数，抛出异常
}


