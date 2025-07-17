/**
 * 用户模型层测试
 */

import { UserModel } from '@/models/user';
import type { CreateUserRequest } from '@/types/user';
import { testDB, resetTestData } from '../../setup/mocks/db-mock';

describe('用户模型层测试', () => {
  let userModel: UserModel;
  
  beforeEach(() => {
    resetTestData();
    userModel = new UserModel(testDB as unknown as D1Database);
  });

  describe('getAllUsers()', () => {
    test('应成功获取所有用户', async () => {
      const users = await userModel.getAllUsers();
      
      expect(Array.isArray(users)).toBe(true);
      expect(users.length).toBeGreaterThan(0);
      expect(users[0]).toHaveProperty('id');
      expect(users[0]).toHaveProperty('name');
      expect(users[0]).toHaveProperty('email');
    });
  });

  describe('createUser()', () => {
    test('应成功创建用户', async () => {
      const userData: CreateUserRequest = {
        name: '新用户',
        email: 'newuser@example.com',
        image: 'https://example.com/avatar.jpg',
        github_id: 'github123'
      };
      
      const user = await userModel.createUser(userData);
      
      expect(user).toBeDefined();
      expect(user.name).toBe('新用户');
      expect(user.email).toBe('newuser@example.com');
      expect(user.image).toBe('https://example.com/avatar.jpg');
      expect(user.github_id).toBe('github123');
      expect(user.id).toBeDefined();
      expect(user.created_at).toBeDefined();
    });
  });

  describe('getUserById()', () => {
    test('应成功通过ID获取用户', async () => {
      const user = await userModel.getUserById(1);
      
      expect(user).toBeDefined();
      expect(user?.id).toBe(1);
      expect(user?.name).toBe('测试用户1');
      expect(user?.email).toBe('test1@example.com');
    });

    test('应处理不存在的用户ID', async () => {
      const user = await userModel.getUserById(999);
      
      expect(user).toBeNull();
    });
  });

  describe('getUserByEmail()', () => {
    test('应成功通过邮箱获取用户', async () => {
      const user = await userModel.getUserByEmail('test1@example.com');
      
      expect(user).toBeDefined();
      expect(user?.email).toBe('test1@example.com');
      expect(user?.name).toBe('测试用户1');
    });

    test('应处理不存在的邮箱', async () => {
      const user = await userModel.getUserByEmail('notexist@example.com');
      
      expect(user).toBeNull();
    });
  });

  describe('getUserByGithubId()', () => {
    test('应成功通过GitHub ID获取用户', async () => {
      const user = await userModel.getUserByGithubId('github123');
      
      expect(user).toBeDefined();
      expect(user?.github_id).toBe('github123');
      expect(user?.name).toBe('测试用户1');
    });

    test('应处理不存在的GitHub ID', async () => {
      const user = await userModel.getUserByGithubId('notexist');
      
      expect(user).toBeNull();
    });
  });

  describe('updateUser()', () => {
    test('应成功更新用户信息', async () => {
      const updateData = {
        name: '更新的名称',
        email: 'updated@example.com'
      };
      
      const updatedUser = await userModel.updateUser(1, updateData);
      
      expect(updatedUser).toBeDefined();
      expect(updatedUser?.id).toBe(1);
      expect(updatedUser?.name).toBe('更新的名称');
      expect(updatedUser?.email).toBe('updated@example.com');
    });

    test('应处理不存在的用户更新', async () => {
      const updateData = {
        name: '更新的名称'
      };
      
      const updatedUser = await userModel.updateUser(999, updateData);
      
      expect(updatedUser).toBeNull();
    });

    test('应处理空的更新数据', async () => {
      const updatedUser = await userModel.updateUser(1, {});
      
      expect(updatedUser).toBeDefined();
      expect(updatedUser?.id).toBe(1);
      // 应该返回原始用户信息
      expect(updatedUser?.name).toBe('测试用户1');
    });
  });

  describe('deleteUser()', () => {
    test('应成功删除用户', async () => {
      const result = await userModel.deleteUser(1);
      
      expect(result).toBe(true);
      
      // 验证用户已被删除
      const user = await userModel.getUserById(1);
      expect(user).toBeNull();
    });

    test('应处理删除不存在的用户', async () => {
      const result = await userModel.deleteUser(999);
      
      expect(result).toBe(true); // 通常删除不存在的记录也返回成功
    });
  });

  describe('upsertUserByGithub()', () => {
    test('应创建新的GitHub用户', async () => {
      const profile = {
        name: 'GitHub用户',
        email: 'github@example.com',
        image: 'https://github.com/avatar.jpg',
        id: 'github789'
      };
      
      const user = await userModel.upsertUserByGithub(profile);
      
      expect(user).toBeDefined();
      expect(user.name).toBe('GitHub用户');
      expect(user.email).toBe('github@example.com');
      expect(user.github_id).toBe('github789');
    });

    test('应更新现有的GitHub用户', async () => {
      const profile = {
        name: '更新的GitHub用户',
        email: 'updated@example.com',
        image: 'https://github.com/updated.jpg',
        id: 'github123' // 这个ID已存在
      };
      
      const user = await userModel.upsertUserByGithub(profile);
      
      expect(user).toBeDefined();
      expect(user.name).toBe('更新的GitHub用户');
      expect(user.email).toBe('updated@example.com');
      expect(user.github_id).toBe('github123');
    });
  });
});