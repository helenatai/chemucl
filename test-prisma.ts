// Add this line at the top
export {};

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function test() {
  try {
    const chemicals = await prisma.chemical.findMany(); // Replace with a known table
    console.log("Successfully connected to the database!");
    console.log("Chemicals:", chemicals);
  } catch (error) {
    console.error("Error querying the database:", error);
  } finally {
    await prisma.$disconnect();
  }
}

test();
