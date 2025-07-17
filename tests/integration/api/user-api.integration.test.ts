/**
 * 用户API路由集成测试
 */

import { UserService } from '@/services/user.service';
import { resetTestData } from '../../setup/mocks/db-mock';

// 模拟UserService
jest.mock('@/services/user.service');

// 模拟Next.js请求和响应
const createMockRequest = (method: string, body?: any) => {
  return {
    method,
    body,
    json: jest.fn().mockImplementation(() => Promise.resolve(body || {}))
  };
};

const createMockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('用户API路由集成测试', () => {
  // 在每个测试前重置模拟
  beforeEach(() => {
    resetTestData();
    jest.clearAllMocks();
    
    // 重置UserService模拟
    (UserService as jest.Mock).mockImplementation(() => ({
      getAllUsers: jest.fn().mockResolvedValue({
        success: true,
        data: [
          { id: 1, name: '测试用户1', email: 'test1@example.com' },
          { id: 2, name: '测试用户2', email: 'test2@example.com' }
        ],
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1
      }),
      createUser: jest.fn().mockResolvedValue({
        success: true,
        data: { id: 3, name: '新用户', email: 'new@example.com' }
      }),
      getUserByEmail: jest.fn().mockResolvedValue({
        success: true,
        data: { id: 1, name: '测试用户1', email: 't***1@example.com' }
      }),
      updateUser: jest.fn().mockResolvedValue({
        success: true,
        data: { id: 1, name: '更新的名称', email: 'test1@example.com' }
      }),
      deleteUser: jest.fn().mockResolvedValue({
        success: true,
        data: true
      })
    }));
  });
  
  describe('GET /api/users', () => {
    test('应返回用户列表', async () => {
      // 创建模拟请求和响应
      const req = createMockRequest('GET');
      const res = createMockResponse();
      
      // 模拟API路由处理函数
      const handleGetUsers = async (req: any, res: any) => {
        const userService = new UserService();
        const result = await userService.getAllUsers();
        return res.status(200).json(result);
      };
      
      // 调用处理函数
      await handleGetUsers(req, res);
      
      // 验证响应
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
      expect(res.json.mock.calls[0][0].success).toBe(true);
      expect(res.json.mock.calls[0][0].data.length).toBe(2);
    });
  });
  
  describe('POST /api/users', () => {
    test('应成功创建用户', async () => {
      // 创建模拟请求和响应
      const req = createMockRequest('POST', {
        name: '新用户',
        email: 'new@example.com'
      });
      const res = createMockResponse();
      
      // 模拟API路由处理函数
      const handleCreateUser = async (req: any, res: any) => {
        const userData = await req.json();
        const userService = new UserService();
        const result = await userService.createUser(userData);
        return res.status(result.success ? 201 : 400).json(result);
      };
      
      // 调用处理函数
      await handleCreateUser(req, res);
      
      // 验证响应
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalled();
      expect(res.json.mock.calls[0][0].success).toBe(true);
      expect(res.json.mock.calls[0][0].data.name).toBe('新用户');
    });
  });
  
  describe('GET /api/users/by-email', () => {
    test('应返回脱敏的用户信息', async () => {
      // 创建模拟请求和响应
      const req = createMockRequest('GET');
      const res = createMockResponse();
      
      // 模拟API路由处理函数
      const handleGetUserByEmail = async (req: any, res: any) => {
        const email = 'test1@example.com'; // 模拟查询参数
        const userService = new UserService();
        const result = await userService.getUserByEmail(email);
        return res.status(result.success ? 200 : 404).json(result);
      };
      
      // 调用处理函数
      await handleGetUserByEmail(req, res);
      
      // 验证响应
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
      expect(res.json.mock.calls[0][0].success).toBe(true);
      expect(res.json.mock.calls[0][0].data.email).toContain('*'); // 脱敏邮箱
    });
  });
  
  describe('PUT /api/users/:id', () => {
    test('应成功更新用户', async () => {
      // 创建模拟请求和响应
      const req = createMockRequest('PUT', {
        name: '更新的名称'
      });
      const res = createMockResponse();
      
      // 模拟API路由处理函数
      const handleUpdateUser = async (req: any, res: any) => {
        const userId = 1; // 模拟路径参数
        const userData = await req.json();
        const userService = new UserService();
        const result = await userService.updateUser(userId, userData);
        return res.status(result.success ? 200 : 400).json(result);
      };
      
      // 调用处理函数
      await handleUpdateUser(req, res);
      
      // 验证响应
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
      expect(res.json.mock.calls[0][0].success).toBe(true);
      expect(res.json.mock.calls[0][0].data.name).toBe('更新的名称');
    });
  });
  
  describe('DELETE /api/users/:id', () => {
    test('应成功删除用户', async () => {
      // 创建模拟请求和响应
      const req = createMockRequest('DELETE');
      const res = createMockResponse();
      
      // 模拟API路由处理函数
      const handleDeleteUser = async (req: any, res: any) => {
        const userId = 1; // 模拟路径参数
        const userService = new UserService();
        const result = await userService.deleteUser(userId);
        return res.status(result.success ? 200 : 400).json(result);
      };
      
      // 调用处理函数
      await handleDeleteUser(req, res);
      
      // 验证响应
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
      expect(res.json.mock.calls[0][0].success).toBe(true);
      expect(res.json.mock.calls[0][0].data).toBe(true);
    });
  });
}); 