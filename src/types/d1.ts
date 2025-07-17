/**
 * Cloudflare D1 数据库类型定义
 */

// D1 结果类型
export interface D1Result<T = unknown> {
  results: T[];
  success: boolean;
  meta?: unknown;
}

// D1 预处理语句
export interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = unknown>(column?: string): Promise<T | null>;
  run<T = unknown>(): Promise<D1Result<T>>;
  all<T = unknown>(): Promise<D1Result<T>>;
}

// D1 数据库
declare global {
  interface D1Database {
    prepare(query: string): D1PreparedStatement;
    exec(query: string): Promise<D1Result<unknown>>;
    batch<T = unknown>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]>;
  }
}

export {}; 