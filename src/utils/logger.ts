// src/utils/logger.ts
export function logError(message: string, error?: any) {
  // 实际项目中可将错误上报到后端日志系统
  console.error(`[Error] ${message}`, error);
}

export function logWarn(message: string) {
  console.warn(`[Warn] ${message}`);
}
