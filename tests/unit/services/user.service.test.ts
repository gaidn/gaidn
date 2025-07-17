/**
 * 用户服务层测试
 */

import { CreateUserRequest } from '@/types/user';
import { testDB, resetTestData } from '../../setup/mocks/db-mock';

// 模拟getDB函数，返回测试数据库
jest.mock('@/lib/db', () => ({
  getDB: jest.fn().mockImplementation(() => Promise.resolve(require('../../setup/mocks/db-mock').testDB)),
  currentDBType: 'mock'
}));

import { UserService } from '@/services/user.service';

describe('用户服务层测试', () => {
  let userService: UserService;
  
  beforeEach(() => {
    resetTestData();
    userService = new UserService();
  });

  describe('getAllUsers()', () => {
    test('应成功获取所有用户', async () => {
      const result = await userService.getAllUsers();
      
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.total).toBeGreaterThan(0);
    });

    test('应支持分页功能', async () => {
      const result = await userService.getAllUsers(1, 1);
      
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.length).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(1);
    });
  });

  describe('createUser()', () => {
    test('应成功创建用户', async () => {
      const userData: CreateUserRequest = {
        name: '新用户',
        email: 'newuser@example.com'
      };
      
      const result = await userService.createUser(userData);
      
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.name).toBe('新用户');
      expect(result.data?.email).toBe('newuser@example.com');
    });

    test('应拒绝无效邮箱格式', async () => {
      const userData: CreateUserRequest = {
        name: '测试用户',
        email: 'invalid-email'
      };
      
      const result = await userService.createUser(userData);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('邮箱格式');
    });

    test('应拒绝重复邮箱', async () => {
      const userData: CreateUserRequest = {
        name: '测试用户',
        email: 'test1@example.com' // 这个邮箱已存在
      };
      
      const result = await userService.createUser(userData);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('已被注册');
    });

    test('应拒绝过短的姓名', async () => {
      const userData: CreateUserRequest = {
        name: 'A', // 只有1个字符
        email: 'test@example.com'
      };
      
      const result = await userService.createUser(userData);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('姓名长度');
    });
  });

  describe('updateUser()', () => {
    test('应成功更新用户信息', async () => {
      const updateData = {
        name: '更新的名称',
        email: 'updated@example.com'
      };
      
      const result = await userService.updateUser(1, updateData);
      
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    test('应拒绝无权限的更新', async () => {
      const updateData = {
        name: '更新的名称'
      };
      
      const result = await userService.updateUser(1, updateData, 999); // 不同的用户ID
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('无权限');
    });

    test('应拒绝更新不存在的用户', async () => {
      const updateData = {
        name: '更新的名称'
      };
      
      const result = await userService.updateUser(999, updateData);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('不存在');
    });
  });

  describe('deleteUser()', () => {
    test('应成功删除用户', async () => {
      const result = await userService.deleteUser(1);
      
      expect(result.success).toBe(true);
      expect(result.data).toBe(true);
    });

    test('应拒绝删除不存在的用户', async () => {
      const result = await userService.deleteUser(999);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('不存在');
    });
  });

  describe('getUserByEmail()', () => {
    test('应成功通过邮箱查找用户（脱敏）', async () => {
      const result = await userService.getUserByEmail('test1@example.com');
      
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.email).toContain('*'); // 验证邮箱已脱敏
    });

    test('应处理不存在的邮箱', async () => {
      const result = await userService.getUserByEmail('notexist@example.com');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('不存在');
    });
  });

  describe('upsertUserByGithub()', () => {
    test('应成功处理GitHub账户', async () => {
      const profile = {
        name: 'GitHub用户',
        email: 'github@example.com',
        image: 'https://github.com/avatar.jpg',
        id: 'github789'
      };
      
      const result = await userService.upsertUserByGithub(profile);
      
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    test('应拒绝不完整的GitHub信息', async () => {
      const profile = {
        name: '',
        email: 'github@example.com',
        id: 'github789'
      };
      
      const result = await userService.upsertUserByGithub(profile);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('不完整');
    });
  });
});