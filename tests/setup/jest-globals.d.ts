/**
 * Jest全局类型声明
 */

import '@testing-library/jest-dom';

// 声明全局Jest变量
declare global {
  namespace jest {
    interface Mock<T = any, Y extends any[] = any[]> {
      new (...args: Y): T;
      (...args: Y): T;
      mockImplementation(fn: (...args: Y) => T): this;
      mockReturnValue(value: T): this;
      mockReturnValueOnce(value: T): this;
      mockResolvedValue<U>(value: U): this;
      mockResolvedValueOnce<U>(value: U): this;
      mockRejectedValue(value: any): this;
      mockRejectedValueOnce(value: any): this;
      mockClear(): this;
      mockReset(): this;
      mockRestore(): this;
      mockImplementationOnce(fn: (...args: Y) => T): this;
      mockReturnThis(): this;
      getMockName(): string;
      mock: {
        calls: Y[];
        instances: T[];
        contexts: any[];
        results: Array<{
          type: 'return' | 'throw';
          value: any;
        }>;
        lastCall: Y;
      };
    }
  }

  const jest: {
    fn: <T = any, Y extends any[] = any[]>() => jest.Mock<T, Y>;
    mock: (moduleName: string, factory?: any) => void;
    doMock: (moduleName: string, factory?: any) => void;
    resetModules: () => void;
    clearAllMocks: () => void;
    resetAllMocks: () => void;
    restoreAllMocks: () => void;
    spyOn: (object: any, method: string) => jest.Mock;
  };
  
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