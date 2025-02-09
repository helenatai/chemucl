import { PrismaClient } from '@prisma/client'; 
//import bcrypt from 'bcrypt';  

const prisma = new PrismaClient();

async function main() {
  try {
    // Clear all existing data
    await prisma.log.deleteMany({});
    await prisma.qrCode.deleteMany({});
    await prisma.auditRecord.deleteMany({});
    await prisma.audit.deleteMany({});
    await prisma.auditGeneral.deleteMany({});
    await prisma.chemical.deleteMany({});
    await prisma.location.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.researchGroup.deleteMany({});

    console.log('All data has been cleared.');

    // Create a ResearchGroup
    const researchGroup = await prisma.researchGroup.create({
      data: {
        groupName: 'Genetic Engineering Lab'
      }
    });

    // // Create initial user with hashed password
    // const hashedPassword = await bcrypt.hash('chemucl', 10);
    // const initialUsersData: Omit<User, 'userID'>[] = [
    //     { email: 'ucabttx@ucl.ac.uk', name: 'Helena', permission: 'Admin', researchGroupID: null, activeStatus: true, registrationDate: new Date(), password: null, emailVerified: null, image: null },
    //     { email: 'admintest@admin.com', name: 'Admin', permission: 'Admin', researchGroupID: null, activeStatus: true, registrationDate: new Date(), password: null, emailVerified: null, image: null },
    //     { email: 'studenttest@student.com', name: 'Student', permission: 'Research Student', researchGroupID: null, activeStatus: true, registrationDate: new Date(), password: null, emailVerified: null, image: null },
    //     { email: 'stafftest@staff.com', name: 'Staff', permission: 'Staff', researchGroupID: null, activeStatus: true, registrationDate: new Date(), password: null, emailVerified: null, image: null },
    //     { email: 'auditortest@auditor.com', name: 'Auditor', permission: 'Auditor', researchGroupID: null, activeStatus: true, registrationDate: new Date(), password: null, emailVerified: null, image: null }
    // ];

    // for (const userData of initialUsersData) {
    //   await prisma.user.create({
    //     data: {
    //       ...userData,
    //       password: hashedPassword,
    //       researchGroupID: researchGroup.researchGroupID,
    //       activeStatus: true
    //     }
    //   });
    // }

    // // Create additional users and assign to ResearchGroup
    // const usersData: Omit<User, 'userID'>[] = [
    //     { email: 'uccakpa@ucl.ac.uk', name: 'Kristopher Page', permission: 'Admin', researchGroupID: null, activeStatus: true, registrationDate: new Date(), password: null, emailVerified: null, image: null },
    //     { email: 'ucca245@ucl.ac.uk', name: 'Andrea Sella', permission: 'Admin', researchGroupID: null, activeStatus: true, registrationDate: new Date(), password: null, emailVerified: null, image: null },
    //     { email: 'ucabelf@ucl.ac.uk', name: 'Aurora', permission: 'Admin', researchGroupID: null, activeStatus: true, registrationDate: new Date(), password: null, emailVerified: null, image: null },
    //     { email: 'ucqsmto@ucl.ac.uk', name: 'Martyn Towner', permission: 'Admin', researchGroupID: null, activeStatus: true, registrationDate: new Date(), password: null, emailVerified: null, image: null },
    //     { email: 'ucabyuf@ucl.ac.uk', name: 'Yun Fu', permission: 'Admin', researchGroupID: null, activeStatus: true, registrationDate: new Date(), password: null, emailVerified: null, image: null },
    //     { email: 'uccahgr@ucl.ac.uk', name: 'Helen Allan', permission: 'Admin', researchGroupID: null, activeStatus: true, registrationDate: new Date(), password: null, emailVerified: null, image: null }
    // ];

    // let lastUser: User | null = null;

    // for (const userData of usersData) {
    //   let user = await prisma.user.findUnique({
    //     where: {
    //       email: userData.email
    //     }
    //   });

    //   if (!user) {
    //     user = await prisma.user.create({
    //       data: {
    //         ...userData,
    //         password: hashedPassword,
    //         activeStatus: true,
    //         researchGroupID: researchGroup.researchGroupID
    //       }
    //     });
    //   }
    //   lastUser = user;
    // }

    // Create a Location
    const location = await prisma.location.create({
      data: {
        building: 'KLLB',
        room: '101',
      }
    });

    // Uncomment these sections if you want to create a Chemical, QrCode, and Log entries as well

    // Create a Chemical including the quantity field
    const chemical = await prisma.chemical.create({
      data: {
        casNumber: '7732-18-5',
        chemicalName: 'Water',
        restrictionStatus: false,
        locationID: location.locationID,
        activeStatus: true,
        researchGroupID: researchGroup.researchGroupID,
        supplier: 'ChemSupply Co.',
        description: 'purified',
        chemicalType: 'Chemical',
        auditStatus: true,
        lastAudit: new Date(),
        quartzyNumber: 'WTR-001',
        quantity: 100
      }
    });

    //Create a QrCode for the chemical
    await prisma.qrCode.create({
      data: {
        type: 'CHEMICAL',
        chemicalID: chemical.chemicalID,
        qrID: 'AAA24'
      }
    });

    // // Create a Log entry
    // if (lastUser) {
    //   await prisma.log.create({
    //     data: {
    //       userID: lastUser.userID,
    //       actionType: 'Added',
    //       chemicalID: chemical.chemicalID,
    //       description: 'Water (Chemical) from ChemSupply Co., was added to location, KLLB 101 Shelf 1 Row 1 Column 1 Box 1',
    //       timestamp: new Date()
    //     }
    //   });
    // }

    console.log('Database has been seeded.');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
