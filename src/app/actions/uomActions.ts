'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getUoms() {
  return await prisma.uom.findMany({ orderBy: { id: 'asc' } });
}

export async function searchUoms(query: string) {
  return await prisma.uom.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ],
    },
    orderBy: { id: 'asc' },
  });
}

export async function createUom(formData: FormData) {
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;

  await prisma.uom.create({
    data: { name, description: description || null },
  });

  revalidatePath('/uom');
}

export async function updateUom(formData: FormData) {
  const id = BigInt(formData.get('id') as string);
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;

  await prisma.uom.update({
    where: { id },
    data: { name, description: description || null },
  });

  revalidatePath('/uom');
}

export async function deleteUom(id: bigint) {
  await prisma.uom.delete({ where: { id } });
  revalidatePath('/uom');
}
