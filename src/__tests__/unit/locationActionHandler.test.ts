import { validateAndProcessLocation } from 'actions/location/locationActionHandler';
import { addLocation, updateLocation, deleteLocation, findLocation } from 'db/queries/Location';
import { getServerSession } from 'next-auth';

// Mock the imports
jest.mock('db/queries/Location');
jest.mock('next-auth');
jest.mock('next/cache');

// Mock the database
jest.mock('db', () => ({
  prisma: {
    location: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

describe('Location Action Handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { id: 'test-user-id', name: 'Test User', permission: 'ADMIN' },
    });
  });

  describe('Add Location', () => {
    it('should successfully add a location', async () => {
      const mockLocation = {
        locationID: 1,
        building: 'Building A',
        buildingName: 'Science Building',
        room: 'Room 101',
        qrID: 'QR123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (addLocation as jest.Mock).mockResolvedValue(mockLocation);

      const result = await validateAndProcessLocation('add', {
        building: 'Building A',
        buildingName: 'Science Building',
        room: 'Room 101',
        qrID: 'QR123'
      });

      expect(result.error).toBeUndefined();
      expect(result.locations).toEqual([mockLocation]);
      expect(addLocation).toHaveBeenCalledWith({
        building: 'Building A',
        buildingName: 'Science Building',
        room: 'Room 101',
        qrID: 'QR123'
      });
    });

    it('should handle validation errors', async () => {
      const result = await validateAndProcessLocation('add', {
        building: '', // Invalid building
        buildingName: 'Science Building',
        room: 'Room 101',
        qrID: 'QR123'
      });

      expect(result.error).toBeDefined();
      expect(result.locations).toEqual([]);
      expect(addLocation).not.toHaveBeenCalled();
    });
  });

  describe('Update Location', () => {
    it('should successfully update a location', async () => {
      const mockLocation = {
        locationID: 1,
        building: 'Building B',
        buildingName: 'Engineering Building',
        room: 'Room 201',
        qrID: 'QR456',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (findLocation as jest.Mock).mockResolvedValue([{ locationID: 1 }]);
      (updateLocation as jest.Mock).mockResolvedValue(mockLocation);

      const result = await validateAndProcessLocation('update', {
        locationID: 1,
        building: 'Building B',
        buildingName: 'Engineering Building',
        room: 'Room 201',
        qrID: 'QR456'
      });

      expect(result.error).toBeUndefined();
      expect(result.locations).toEqual([mockLocation]);
      expect(updateLocation).toHaveBeenCalledWith({
        locationID: 1,
        building: 'Building B',
        buildingName: 'Engineering Building',
        room: 'Room 201',
        qrID: 'QR456'
      });
    });
  });

  describe('Delete Location', () => {
    it('should successfully delete locations', async () => {
      (deleteLocation as jest.Mock).mockResolvedValue({ count: 1 });

      const result = await validateAndProcessLocation('delete', {
        locationIDs: [1, 2, 3]
      });

      expect(result.error).toBeUndefined();
      expect(result.locations).toEqual([]);
      expect(deleteLocation).toHaveBeenCalledTimes(3);
    });

    it('should handle invalid delete request', async () => {
      const result = await validateAndProcessLocation('delete', {
        locationIDs: [] // Empty array
      });

      expect(result.error).toBe('Invalid request: No locations selected for deletion.');
      expect(result.locations).toEqual([]);
      expect(deleteLocation).not.toHaveBeenCalled();
    });
  });
}); 