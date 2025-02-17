// src/utils/logger.ts
export function logError(message: string, error?: any) {
  // 实际项目中可以将错误上报到后端日志系统
  console.error(`[Error] ${message}`, error);
}

export function logWarn(message: string) {
  console.warn(`[Warn] ${message}`);
}

export function logInfo(message: string) {
  console.info(`[Info] ${message}`);
}

// 统一错误处理函数：根据环境输出错误信息
export function handleError(fn: () => void, errorMessage: string) {
  try {
    fn();
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      // 开发环境：输出详细的错误信息
      logError(errorMessage, error);
    } else {
      // 生产环境：只输出统一的错误提示
      logError(errorMessage);
    }
    throw new Error(errorMessage); // 抛出统一错误信息
  }
}
