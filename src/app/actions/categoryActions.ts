'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getCategories() {
  return await prisma.testCategory.findMany({ orderBy: { id: 'asc' } });
}

export async function searchCategories(query: string) {
  return await prisma.testCategory.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ],
    },
    orderBy: { id: 'asc' },
  });
}

export async function createCategory(formData: FormData) {
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;

  await prisma.testCategory.create({
    data: { name, description: description || null },
  });

  revalidatePath('/categories');
}

export async function updateCategory(formData: FormData) {
  const id = BigInt(formData.get('id') as string);
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;

  await prisma.testCategory.update({
    where: { id },
    data: { name, description: description || null },
  });

  revalidatePath('/categories');
}

export async function deleteCategory(id: bigint) {
  await prisma.testCategory.delete({ where: { id } });
  revalidatePath('/categories');
}
