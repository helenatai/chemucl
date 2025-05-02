import '@testing-library/jest-dom';
import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { validateAndProcessChemical } from 'actions/chemical/chemicalActionHandler';
import { validateAndProcessLocation } from 'actions/location/locationActionHandler';
import { ChemicalWithRelations } from 'types/chemical';
import { LocationWithRelations } from 'types/location';
import { Session, getServerSession } from 'next-auth';
import { findChemical, addChemical, updateChemical, deleteChemical } from 'db/queries/Chemical';
import { findLocation, deleteLocation } from 'db/queries/Location';
import { findLogs, addLog } from 'db/queries/Log';
import { revalidatePath } from 'next/cache';

// Mock next-auth
jest.mock('next-auth', () => ({
  getServerSession: jest.fn()
}));

// Mock next/cache
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn()
}));

// Mock the database
jest.mock('db', () => ({
  prisma: {
    chemical: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    },
    location: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    },
    researchGroup: {
      findFirst: jest.fn()
    },
    log: {
      create: jest.fn()
    }
  }
}));

// Mock database queries
jest.mock('db/queries/Chemical', () => ({
  findChemical: jest.fn(),
  addChemical: jest.fn(),
  updateChemical: jest.fn(),
  deleteChemical: jest.fn()
}));

jest.mock('db/queries/Location', () => ({
  findLocation: jest.fn(),
  addLocation: jest.fn(),
  updateLocation: jest.fn(),
  deleteLocation: jest.fn()
}));

jest.mock('db/queries/Log', () => ({
  findLogs: jest.fn(),
  addLog: jest.fn()
}));

describe('Chemical-Location Integration Tests', () => {
  const mockSession: Session = {
    user: {
      id: 'test-user-id',
      email: 'test@example.com',
      name: 'Test User',
      permission: 'ADMIN'
    },
    expires: new Date(Date.now() + 2 * 86400).toISOString()
  };

  const mockLocation: LocationWithRelations = {
    locationID: 1,
    building: 'Building A',
    buildingName: 'Building A',
    room: 'Room 101',
    qrID: '123-4567',
    totalChemicals: 0
  };

  const mockChemical: ChemicalWithRelations = {
    chemicalID: 1,
    chemicalName: 'Test Chemical',
    casNumber: null,
    qrID: 'ABC12',
    restrictionStatus: false,
    location: {
      locationID: mockLocation.locationID,
      building: mockLocation.building,
      buildingName: mockLocation.buildingName,
      room: mockLocation.room
    },
    chemicalType: 'Chemical',
    researchGroup: {
      researchGroupID: 1,
      groupName: 'Test Group'
    },
    activeStatus: true,
    supplier: null,
    description: null,
    quartzyNumber: null,
    quantity: 1000,
    subLocation1: null,
    subLocation2: null,
    subLocation3: null,
    subLocation4: null
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (getServerSession as any).mockResolvedValue(mockSession);
    (findLocation as any).mockResolvedValue([mockLocation]);
    (findChemical as any).mockResolvedValue(mockChemical);
    (findLogs as any).mockResolvedValue([]);
    (revalidatePath as any).mockReturnValue(undefined);
    (addChemical as any).mockResolvedValue(mockChemical);
    (updateChemical as any).mockResolvedValue(mockChemical);
    (addLog as any).mockResolvedValue({});
    (deleteChemical as any).mockResolvedValue({});
    (deleteLocation as any).mockResolvedValue({});
  });

  it('should successfully add a chemical to a location', async () => {
    const result = await validateAndProcessChemical('add', {
      chemicalName: 'Test Chemical',
      casNumber: null,
      qrID: 'ABC12',
      restrictionStatus: false,
      locationID: mockLocation.locationID,
      chemicalType: 'Chemical',
      researchGroupID: mockLocation.locationID,
      quantity: 1000
    });

    expect(result.error).toBeUndefined();
    expect(result.chemicals[0].location?.locationID).toBe(mockLocation.locationID);
  });

  it('should prevent adding a chemical to a non-existent location', async () => {
    (findLocation as any).mockResolvedValue([]);
    (addChemical as any).mockRejectedValue(new Error('Location not found'));

    const result = await validateAndProcessChemical('add', {
      chemicalName: 'Test Chemical',
      casNumber: null,
      qrID: 'ABC12',
      restrictionStatus: false,
      locationID: 999,
      chemicalType: 'Chemical',
      researchGroupID: 1,
      quantity: 1000
    });

    expect(result.error).toBeDefined();
    expect(result.chemicals).toHaveLength(0);
  });

  it('should update chemical location', async () => {
    const newLocation: LocationWithRelations = {
      locationID: 2,
      building: 'Building B',
      buildingName: 'Building B',
      room: 'Room 202',
      qrID: '123-4567',
      totalChemicals: 0
    };

    const updatedChemical = {
      ...mockChemical,
      location: {
        locationID: newLocation.locationID,
        building: newLocation.building,
        buildingName: newLocation.buildingName,
        room: newLocation.room
      }
    };

    (findLocation as any).mockResolvedValue([newLocation]);
    (updateChemical as any).mockResolvedValue(updatedChemical);

    const result = await validateAndProcessChemical('update', {
      chemicalID: mockChemical.chemicalID,
      chemicalName: mockChemical.chemicalName,
      casNumber: mockChemical.casNumber,
      qrID: mockChemical.qrID,
      restrictionStatus: mockChemical.restrictionStatus,
      locationID: newLocation.locationID,
      chemicalType: mockChemical.chemicalType,
      researchGroupID: mockChemical.researchGroup.researchGroupID,
      quantity: mockChemical.quantity
    });

    expect(result.error).toBeUndefined();
    expect(result.chemicals[0].location?.locationID).toBe(newLocation.locationID);
  });

  it('should handle location deletion with associated chemicals', async () => {
    const locationWithChemicals: LocationWithRelations = {
      ...mockLocation,
      totalChemicals: 1
    };

    (findLocation as any).mockResolvedValue([locationWithChemicals]);
    (findChemical as any).mockResolvedValue({
      ...mockChemical,
      location: {
        locationID: locationWithChemicals.locationID,
        building: locationWithChemicals.building,
        buildingName: locationWithChemicals.buildingName,
        room: locationWithChemicals.room
      }
    });
    (deleteLocation as any).mockRejectedValue(new Error('Cannot delete location with associated chemicals'));

    const result = await validateAndProcessLocation('delete', {
      locationIDs: [locationWithChemicals.locationID]
    });

    expect(result.error).toBeDefined();
    expect(result.error).toContain('Cannot delete location with associated chemicals');
  });
});
