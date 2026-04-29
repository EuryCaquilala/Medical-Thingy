'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getMedicalTests() {
  const tests = await prisma.medicalTest.findMany({
    include: {
      uom: true,
      category: true,
    },
    orderBy: { id: 'asc' },
  });

  return tests.map((test) => ({
    id: test.id,
    name: test.name,
    description: test.description,
    iduom: test.iduom,
    idcategory: test.idcategory,
    normalmin: test.normalmin,
    normalmax: test.normalmax,
    uomName: test.uom?.name ?? 'N/A',
    categoryName: test.category?.name ?? 'N/A',
  }));
}

export async function searchMedicalTests(query: string) {
  const tests = await prisma.medicalTest.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { uom: { name: { contains: query, mode: 'insensitive' } } },
        { category: { name: { contains: query, mode: 'insensitive' } } },
      ],
    },
    include: {
      uom: true,
      category: true,
    },
    orderBy: { id: 'asc' },
  });

  return tests.map((test) => ({
    id: test.id,
    name: test.name,
    description: test.description,
    iduom: test.iduom,
    idcategory: test.idcategory,
    normalmin: test.normalmin,
    normalmax: test.normalmax,
    uomName: test.uom?.name ?? 'N/A',
    categoryName: test.category?.name ?? 'N/A',
  }));
}

export async function createMedicalTest(formData: FormData) {
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const iduom = formData.get('iduom') as string;
  const idcategory = formData.get('idcategory') as string;
  const normalmin = formData.get('normalmin') as string;
  const normalmax = formData.get('normalmax') as string;

  await prisma.medicalTest.create({
    data: {
      name,
      description: description || null,
      iduom: iduom ? BigInt(iduom) : null,
      idcategory: idcategory ? BigInt(idcategory) : null,
      normalmin: normalmin ? parseFloat(normalmin) : null,
      normalmax: normalmax ? parseFloat(normalmax) : null,
    },
  });

  revalidatePath('/medical-tests');
}

export async function updateMedicalTest(formData: FormData) {
  const id = BigInt(formData.get('id') as string);
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const iduom = formData.get('iduom') as string;
  const idcategory = formData.get('idcategory') as string;
  const normalmin = formData.get('normalmin') as string;
  const normalmax = formData.get('normalmax') as string;

  await prisma.medicalTest.update({
    where: { id },
    data: {
      name,
      description: description || null,
      iduom: iduom ? BigInt(iduom) : null,
      idcategory: idcategory ? BigInt(idcategory) : null,
      normalmin: normalmin ? parseFloat(normalmin) : null,
      normalmax: normalmax ? parseFloat(normalmax) : null,
    },
  });

  revalidatePath('/medical-tests');
}

export async function deleteMedicalTest(id: bigint) {
  await prisma.medicalTest.delete({ where: { id } });
  revalidatePath('/medical-tests');
}

export async function getUomsForSelect() {
  return await prisma.uom.findMany({ orderBy: { id: 'asc' } });
}

export async function getCategoriesForSelect() {
  return await prisma.testCategory.findMany({ orderBy: { id: 'asc' } });
}
