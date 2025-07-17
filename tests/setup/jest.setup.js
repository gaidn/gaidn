// 导入Jest DOM扩展
require('@testing-library/jest-dom');

// 模拟全局环境变量
process.env.NODE_ENV = 'test';

// 模拟控制台日志，减少测试输出噪音
global.console = {
  ...console,
  log: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
  // 保留错误和警告日志，便于调试
  error: console.error,
  warn: console.warn,
};

// 模拟D1Database全局类型
global.D1Database = class {};

// 模拟Cloudflare环境
jest.mock('@opennextjs/cloudflare', () => ({
  getCloudflareContext: jest.fn().mockImplementation(() => ({
    env: {
      DB: {
        prepare: jest.fn().mockImplementation(() => ({
          all: jest.fn().mockResolvedValue({ results: [], success: true }),
          first: jest.fn().mockResolvedValue(null),
          run: jest.fn().mockResolvedValue({ success: true }),
          bind: jest.fn().mockImplementation(() => ({
            all: jest.fn().mockResolvedValue({ results: [], success: true }),
            first: jest.fn().mockResolvedValue(null),
            run: jest.fn().mockResolvedValue({ success: true }),
          })),
        })),
        exec: jest.fn().mockResolvedValue({ success: true }),
      },
    },
  })),
})); 