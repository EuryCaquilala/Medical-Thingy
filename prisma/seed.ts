import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // Clear existing data
  await prisma.medicalTest.deleteMany();
  await prisma.uom.deleteMany();
  await prisma.testCategory.deleteMany();

  // 1. Seed Units of Measure
  const mgdl = await prisma.uom.create({
    data: {
      name: 'mg/dL',
      description: 'Measures concentration of substances in blood',
    },
  });

  const mmoll = await prisma.uom.create({
    data: {
      name: 'mmol/L',
      description: 'Measures concentration of chemicals in blood (International)',
    },
  });

  const gdl = await prisma.uom.create({
    data: {
      name: 'g/dL',
      description: 'Measures protein levels such as hemoglobin',
    },
  });

  const iul = await prisma.uom.create({
    data: {
      name: 'IU/L',
      description: 'Measures enzyme or hormone activity levels',
    },
  });

  const cellsul = await prisma.uom.create({
    data: {
      name: 'cells/µL',
      description: 'Counts the number of cells in blood',
    },
  });

  // 2. Seed Test Categories
  const bct = await prisma.testCategory.create({
    data: {
      name: 'BCT',
      description: 'Blood Glucose Test',
    },
  });

  const cbc = await prisma.testCategory.create({
    data: {
      name: 'CBC',
      description: 'Complete Blood Count',
    },
  });

  const lft = await prisma.testCategory.create({
    data: {
      name: 'LFT',
      description: 'Liver Function Test',
    },
  });

  // 3. Seed Medical Tests
  await prisma.medicalTest.createMany({
    data: [
      {
        name: 'Fasting Blood Glucose',
        iduom: mgdl.id,
        idcategory: bct.id,
        normalmin: 70,
        normalmax: 99,
      },
      {
        name: 'Hemoglobin Male',
        iduom: gdl.id,
        idcategory: cbc.id,
        normalmin: 13.5,
        normalmax: 17.5,
      },
      {
        name: 'Hemoglobin Female',
        iduom: gdl.id,
        idcategory: cbc.id,
        normalmin: 12.5,
        normalmax: 15.5,
      },
      {
        name: 'White Blood Cell Count',
        iduom: cellsul.id,
        idcategory: cbc.id,
        normalmin: 4000,
        normalmax: 11000,
      },
      {
        name: 'Alanine Aminotransferase',
        iduom: iul.id,
        idcategory: lft.id,
        normalmin: 7,
        normalmax: 56,
      },
    ],
  });

  console.log('✅ Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
