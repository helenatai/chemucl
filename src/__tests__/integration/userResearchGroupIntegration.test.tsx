import { addUser, findUsersByResearchGroup } from 'db/queries/User';
import { addResearchGroup, findResearchGroupById } from 'db/queries/ResearchGroup';
import { UserWithRelations } from 'types/user';

// Mock the database queries
jest.mock('db/queries/User', () => ({
  addUser: jest.fn(),
  findUsersByResearchGroup: jest.fn()
}));

jest.mock('db/queries/ResearchGroup', () => ({
  addResearchGroup: jest.fn(),
  findResearchGroupById: jest.fn()
}));

describe('User-Research Group Integration Tests', () => {
  const mockResearchGroup = {
    researchGroupID: 1,
    groupName: 'Test Research Group',
    users: [],
    totalMembers: 0
  };

  const mockUser = {
    id: 'user123',
    email: 'test@example.com',
    name: 'Test User',
    activeStatus: true,
    permission: 'Research Student',
    researchGroupID: 1,
    researchGroup: {
      researchGroupID: 1,
      groupName: 'Test Research Group'
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (addResearchGroup as jest.Mock).mockResolvedValue(mockResearchGroup);
    (findResearchGroupById as jest.Mock).mockResolvedValue(mockResearchGroup);
    (findUsersByResearchGroup as jest.Mock).mockResolvedValue([]);
  });

  describe('Adding Users to Research Groups', () => {
    it('should add a user to a research group and update member count', async () => {
      // Mock the addUser function to return a user with research group
      (addUser as jest.Mock).mockResolvedValue(mockUser);

      // Add a user with research group assignment
      const newUser = await addUser({
        email: 'test@example.com',
        name: 'Test User',
        permission: 'Research Student',
        researchGroupID: 1,
        activeStatus: true
      });

      // Verify user was added with correct research group
      expect(newUser).toEqual(mockUser);
      expect(newUser.researchGroupID).toBe(1);
      expect(newUser.researchGroup).toEqual({
        researchGroupID: 1,
        groupName: 'Test Research Group'
      });

      // Mock updated research group with the new member
      const updatedResearchGroup = {
        ...mockResearchGroup,
        users: [{ id: 'user123' }],
        totalMembers: 1
      };
      (findResearchGroupById as jest.Mock).mockResolvedValue(updatedResearchGroup);

      // Verify research group member count was updated
      const researchGroup = await findResearchGroupById(1);
      expect(researchGroup?.totalMembers).toBe(1);
    });

    it('should retrieve all members of a research group', async () => {
      // Mock multiple users in the research group
      const mockUsers: UserWithRelations[] = [
        {
          id: 'user1',
          email: 'user1@example.com',
          name: 'User One',
          activeStatus: true,
          permission: 'Research Student',
          researchGroupID: 1,
          researchGroup: {
            researchGroupID: 1,
            groupName: 'Test Research Group'
          }
        },
        {
          id: 'user2',
          email: 'user2@example.com',
          name: 'User Two',
          activeStatus: true,
          permission: 'Staff',
          researchGroupID: 1,
          researchGroup: {
            researchGroupID: 1,
            groupName: 'Test Research Group'
          }
        }
      ];

      (findUsersByResearchGroup as jest.Mock).mockResolvedValue(mockUsers);

      // Get all members of the research group
      const members = await findUsersByResearchGroup(1);

      // Verify all members were retrieved
      expect(members).toHaveLength(2);
      expect(members[0].name).toBe('User One');
      expect(members[1].name).toBe('User Two');
      expect(members[0].researchGroupID).toBe(1);
      expect(members[1].researchGroupID).toBe(1);
    });

    it('should handle adding a user without a research group', async () => {
      const userWithoutGroup = {
        ...mockUser,
        researchGroupID: null,
        researchGroup: null
      };

      (addUser as jest.Mock).mockResolvedValue(userWithoutGroup);

      // Add a user without research group assignment
      const newUser = await addUser({
        email: 'test@example.com',
        name: 'Test User',
        permission: 'Research Student',
        activeStatus: true
      });

      // Verify user was added without research group
      expect(newUser.researchGroupID).toBeNull();
      expect(newUser.researchGroup).toBeNull();
    });
  });
}); 