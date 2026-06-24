import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const SUPERADMIN_EMAIL = process.env.SUPERADMIN_EMAIL || 'superadmin@manoscreadoras.com';
const SUPERADMIN_PASSWORD = process.env.SUPERADMIN_PASSWORD || 'SuperAdmin2024!';
const SUPERADMIN_NAME = process.env.SUPERADMIN_NAME || 'Super Administrador';

async function seed() {
  console.log('Conectando a PostgreSQL...');

  await prisma.user.deleteMany({ where: { role: 'superadmin' } });
  console.log('Superadmins anteriores eliminados');

  const hashedPassword = await bcrypt.hash(SUPERADMIN_PASSWORD, 10);

  const superadmin = await prisma.user.create({
    data: {
      name: SUPERADMIN_NAME,
      email: SUPERADMIN_EMAIL,
      password: hashedPassword,
      role: 'superadmin',
      mustChangePassword: false,
      isActive: true,
    },
  });

  console.log('\n=== SuperAdmin creado exitosamente ===');
  console.log(`Nombre:   ${SUPERADMIN_NAME}`);
  console.log(`Email:    ${SUPERADMIN_EMAIL}`);
  console.log(`Password: ${SUPERADMIN_PASSWORD}`);
  console.log(`ID:       ${superadmin.id}`);
  console.log('=====================================\n');
}

seed()
  .catch((err) => {
    console.error('Error al crear superadmin:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
