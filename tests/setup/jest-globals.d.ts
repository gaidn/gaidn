/**
 * Jest全局类型声明
 */

import '@testing-library/jest-dom';

// 声明全局Jest变量
declare global {
  const jest: any;
  const describe: (name: string, fn: () => void) => void;
  const test: (name: string, fn: () => void | Promise<void>, timeout?: number) => void;
  const it: typeof test;
  const expect: any;
  const beforeAll: (fn: () => void | Promise<void>, timeout?: number) => void;
  const beforeEach: (fn: () => void | Promise<void>, timeout?: number) => void;
  const afterAll: (fn: () => void | Promise<void>, timeout?: number) => void;
  const afterEach: (fn: () => void | Promise<void>, timeout?: number) => void;
  
  // 声明D1Database类型
  interface D1Database {
    prepare(query: string): {
      bind(...values: any[]): {
        first<T = any>(): Promise<T | null>;
        run<T = any>(): Promise<{ success: boolean; results?: T[] }>;
        all<T = any>(): Promise<{ results: T[]; success: boolean }>;
      };
      first<T = any>(): Promise<T | null>;
      run<T = any>(): Promise<{ success: boolean }>;
      all<T = any>(): Promise<{ results: T[]; success: boolean }>;
    };
    exec(query: string): Promise<{ success: boolean }>;
  }

  // 允许修改环境变量
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: string;
    }
  }
}