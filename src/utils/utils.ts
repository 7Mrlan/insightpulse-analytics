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
