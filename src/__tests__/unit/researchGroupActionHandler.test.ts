import { validateAndProcessResearchGroup } from 'actions/research-group/researchGroupActionHandler';
import { prisma } from 'db';
import { revalidatePath } from 'next/cache';

// Mock the database
jest.mock('db', () => ({
  prisma: {
    researchGroup: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    }
  }
}));

// Mock revalidatePath
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn()
}));

describe('Research Group Action Handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Find Research Groups', () => {
    it('should successfully find research groups', async () => {
      const mockGroups = [
        { researchGroupID: 1, groupName: 'Group A', totalMembers: 5 },
        { researchGroupID: 2, groupName: 'Group B', totalMembers: 3 }
      ];

      (prisma.researchGroup.findMany as jest.Mock).mockResolvedValue(mockGroups);

      const result = await validateAndProcessResearchGroup('find', {
        groupName: 'Group'
      });

      expect(result.error).toBeUndefined();
      expect(result.researchGroups).toEqual(mockGroups);
      expect(prisma.researchGroup.findMany).toHaveBeenCalledWith({
        where: {
          groupName: {
            contains: 'Group',
            mode: 'insensitive'
          }
        }
      });
    });

    it('should find all research groups when no search term is provided', async () => {
      const mockGroups = [
        { researchGroupID: 1, groupName: 'Group A', totalMembers: 5 },
        { researchGroupID: 2, groupName: 'Group B', totalMembers: 3 }
      ];

      (prisma.researchGroup.findMany as jest.Mock).mockResolvedValue(mockGroups);

      const result = await validateAndProcessResearchGroup('find', {});

      expect(result.error).toBeUndefined();
      expect(result.researchGroups).toEqual(mockGroups);
      expect(prisma.researchGroup.findMany).toHaveBeenCalledWith({
        where: undefined
      });
    });
  });

  describe('Add Research Group', () => {
    it('should successfully add a research group', async () => {
      const mockGroup = {
        researchGroupID: 1,
        groupName: 'New Group',
        totalMembers: 0
      };

      (prisma.researchGroup.create as jest.Mock).mockResolvedValue(mockGroup);

      const result = await validateAndProcessResearchGroup('add', {
        groupName: 'New Group'
      });

      expect(result.error).toBeUndefined();
      expect(result.researchGroup).toEqual(mockGroup);
      expect(prisma.researchGroup.create).toHaveBeenCalledWith({
        data: {
          groupName: 'New Group'
        }
      });
      expect(revalidatePath).toHaveBeenCalledWith('/user-page/research-group');
    });

    it('should handle validation errors', async () => {
      const result = await validateAndProcessResearchGroup('add', {
        groupName: '' // Empty group name
      });

      expect(result.error).toBeDefined();
      expect(result.researchGroup).toBeUndefined();
      expect(prisma.researchGroup.create).not.toHaveBeenCalled();
      expect(revalidatePath).not.toHaveBeenCalled();
    });
  });

  describe('Update Research Group', () => {
    it('should successfully update a research group', async () => {
      const mockGroup = {
        researchGroupID: 1,
        groupName: 'Updated Group',
        totalMembers: 5
      };

      (prisma.researchGroup.update as jest.Mock).mockResolvedValue(mockGroup);

      const result = await validateAndProcessResearchGroup('update', {
        researchGroupID: 1,
        groupName: 'Updated Group'
      });

      expect(result.error).toBeUndefined();
      expect(result.researchGroup).toEqual(mockGroup);
      expect(prisma.researchGroup.update).toHaveBeenCalledWith({
        where: { researchGroupID: 1 },
        data: {
          groupName: 'Updated Group'
        }
      });
      expect(revalidatePath).toHaveBeenCalledWith('/user-page/research-group');
    });

    it('should handle missing researchGroupID', async () => {
      const result = await validateAndProcessResearchGroup('update', {
        groupName: 'Updated Group'
      });

      expect(result.error).toBe('researchGroupID is required for update.');
      expect(result.researchGroup).toBeUndefined();
      expect(prisma.researchGroup.update).not.toHaveBeenCalled();
      expect(revalidatePath).not.toHaveBeenCalled();
    });
  });

  describe('Delete Research Group', () => {
    it('should successfully delete a research group', async () => {
      const mockGroup = {
        researchGroupID: 1,
        groupName: 'Group to Delete',
        totalMembers: 0
      };

      (prisma.researchGroup.delete as jest.Mock).mockResolvedValue(mockGroup);

      const result = await validateAndProcessResearchGroup('delete', {
        researchGroupID: 1
      });

      expect(result.error).toBeUndefined();
      expect(result.researchGroup).toEqual(mockGroup);
      expect(prisma.researchGroup.delete).toHaveBeenCalledWith({
        where: { researchGroupID: 1 }
      });
      expect(revalidatePath).toHaveBeenCalledWith('/user-page/research-group');
    });

    it('should handle missing researchGroupID', async () => {
      const result = await validateAndProcessResearchGroup('delete', {});

      expect(result.error).toBe('researchGroupID is required for delete.');
      expect(result.researchGroup).toBeUndefined();
      expect(prisma.researchGroup.delete).not.toHaveBeenCalled();
      expect(revalidatePath).not.toHaveBeenCalled();
    });
  });

  describe('Invalid Action', () => {
    it('should handle invalid action', async () => {
      const result = await validateAndProcessResearchGroup('invalid', {});

      expect(result.error).toBe('Invalid action specified.');
      expect(result.researchGroup).toBeUndefined();
      expect(revalidatePath).not.toHaveBeenCalled();
    });
  });
});
