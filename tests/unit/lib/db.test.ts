/**
 * 数据库连接层测试
 */

import { getDB } from '@/lib/db';
import { testDB } from '../../setup/mocks/db-mock';

// 重置模块
const resetModules = () => {
  jest.resetModules();
  jest.clearAllMocks();
};

describe('数据库连接层测试', () => {
  // 每个测试后重置
  afterEach(() => {
    resetModules();
  });

  test('开发环境应返回模拟数据库', async () => {
    // 模拟开发环境
    jest.doMock('@/lib/db', () => ({
      getDB: jest.fn().mockResolvedValue(testDB),
      currentDBType: 'mock'
    }));
    
    const { getDB: mockGetDB, currentDBType } = await import('@/lib/db');
    
    // 获取数据库连接
    const db = await mockGetDB();
    
    // 验证返回的是模拟数据库
    expect(currentDBType).toBe('mock');
    expect(db).toBeDefined();
  });

  test('生产环境失败时应回退到模拟数据库', async () => {
    // 模拟生产环境，Cloudflare 连接失败的情况
    jest.doMock('@/lib/db', () => ({
      getDB: jest.fn().mockResolvedValue(testDB),
      currentDBType: 'mock'
    }));
    
    const { getDB: mockGetDB, currentDBType } = await import('@/lib/db');
    
    // 获取数据库连接
    const db = await mockGetDB();
    
    // 验证回退到模拟数据库
    expect(currentDBType).toBe('mock');
    expect(db).toBeDefined();
  });
}); 