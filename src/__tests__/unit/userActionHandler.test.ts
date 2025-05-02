import { validateAndProcessUser } from 'actions/user/userActionHandler';
import { addUser, updateUser, deleteUser, findUser } from 'db/queries/User';
import { getServerSession } from 'next-auth';
import bcrypt from 'bcrypt';

// Mock the imports
jest.mock('db/queries/User');
jest.mock('next-auth');
jest.mock('next/cache');
jest.mock('bcrypt');

// Mock the database
jest.mock('db', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    },
    researchGroup: {
      findFirst: jest.fn()
    }
  }
}));

describe('User Action Handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { id: 'test-user-id', name: 'Test User', permission: 'ADMIN' }
    });
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');
  });

  describe('Add User', () => {
    it('should successfully add a user', async () => {
      const mockUser = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        permission: 'Staff',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      (addUser as jest.Mock).mockResolvedValue(mockUser);

      const result = await validateAndProcessUser('add', {
        fullName: 'Test User',
        email: 'test@example.com',
        role: 'Staff',
        researchGroupID: '1'
      });

      expect(result.error).toBeUndefined();
      expect(result.message).toBe('User added successfully');
      expect(result.users).toEqual([mockUser]);
      expect(addUser).toHaveBeenCalledWith({
        name: 'Test User',
        email: 'test@example.com',
        permission: 'Staff',
        researchGroupID: 1,
        password: expect.any(String)
      });
    });

    it('should handle validation errors', async () => {
      const result = await validateAndProcessUser('add', {
        fullName: '', // Invalid name
        email: 'test@example.com',
        role: 'Staff',
        researchGroupID: '1'
      });

      expect(result.error).toBeDefined();
      expect(result.users).toEqual([]);
      expect(addUser).not.toHaveBeenCalled();
    });
  });

  describe('Update User', () => {
    it('should successfully update a user', async () => {
      const mockUser = {
        id: '1',
        name: 'Updated User',
        email: 'updated@example.com',
        permission: 'ADMIN',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      (findUser as jest.Mock).mockResolvedValue([{ id: '1' }]);
      (updateUser as jest.Mock).mockResolvedValue(mockUser);

      const result = await validateAndProcessUser('update', {
        id: '1',
        activeStatus: true
      });

      expect(result.error).toBeUndefined();
      expect(result.message).toBe('User updated successfully');
      expect(result.users).toEqual([mockUser]);
      expect(updateUser).toHaveBeenCalledWith({
        id: '1',
        activeStatus: true
      });
    });
  });

  describe('Delete User', () => {
    it('should successfully delete users', async () => {
      (deleteUser as jest.Mock).mockResolvedValue({ count: 1 });

      const result = await validateAndProcessUser('delete', {
        userIds: ['1', '2', '3']
      });

      expect(result.error).toBeUndefined();
      expect(result.users).toEqual([]);
      expect(deleteUser).toHaveBeenCalledTimes(1);
      expect(deleteUser).toHaveBeenCalledWith(['1', '2', '3']);
    });

    it('should handle invalid delete request', async () => {
      const result = await validateAndProcessUser('delete', {
        userIds: [] // Empty array
      });

      expect(result.error).toBe('Invalid request: No locations selected for deletion.');
      expect(result.users).toEqual([]);
      expect(deleteUser).not.toHaveBeenCalled();
    });
  });

  describe('Unauthorized Access', () => {
    it('should handle unauthorized access', async () => {
      (getServerSession as jest.Mock).mockResolvedValue({
        user: { id: 'test-user-id', name: 'Test User', permission: 'staff' }
      });

      const result = await validateAndProcessUser('add', {
        fullName: 'Test User',
        email: 'test@example.com',
        role: 'Staff',
        researchGroupID: '1'
      });

      expect(result.error).toBe('Unauthorized: Only administrators can manage users');
      expect(result.users).toEqual([]);
      expect(addUser).not.toHaveBeenCalled();
    });
  });
});
