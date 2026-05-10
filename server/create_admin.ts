import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
const prisma = new PrismaClient();
async function main() {
  const hash = await bcrypt.hash('Admin@1234', 12);
  await prisma.user.upsert({
    where: { email: 'admin@traveloop.com' },
    update: { isAdmin: true },
    create: { name: 'Admin', email: 'admin@traveloop.com', password: hash, isAdmin: true }
  });
  console.log('ADMIN_CREATED');
}
main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
