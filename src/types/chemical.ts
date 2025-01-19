import { Chemical as PrismaChemical } from '@prisma/client';

// Extend the Chemical type to include relations
export type ChemicalWithRelations = PrismaChemical & {
  location?: {
    locationID: number;
    qrID: string | null;
    building: string;
    room: string;
    subLocation1: string | null;
    subLocation2: string | null;
    subLocation3: string | null;
    subLocation4: string | null;
  } | null;
  researchGroup?: {
    groupName: string;
  } | null;
};
