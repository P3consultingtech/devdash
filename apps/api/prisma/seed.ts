import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create demo user
  const passwordHash = await bcrypt.hash('password123', 12);

  const user = await prisma.user.upsert({
    where: { email: 'demo@devdash.dev' },
    update: {},
    create: {
      email: 'demo@devdash.dev',
      passwordHash,
      firstName: 'Mario',
      lastName: 'Rossi',
      locale: 'it',
      settings: {
        create: {
          defaultIvaRate: 22,
          defaultApplyRitenuta: true,
          defaultRitenutaRate: 20,
          invoicePrefix: 'FT',
        },
      },
    },
  });

  // Create business profile
  await prisma.businessProfile.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      businessName: 'Mario Rossi - Sviluppo Software',
      partitaIva: '12345678903',
      codiceFiscale: 'RSSMRA85M01H501Z',
      codiceDestinatario: '0000000',
      regimeFiscale: 'RF01',
      street: 'Via Roma 1',
      city: 'Milano',
      province: 'MI',
      postalCode: '20100',
      country: 'IT',
      email: 'mario@example.com',
      pec: 'mario@pec.example.com',
      iban: 'IT60X0542811101000000123456',
    },
  });

  // Create clients
  const client1 = await prisma.client.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      userId: user.id,
      type: 'BUSINESS',
      name: 'Acme S.r.l.',
      email: 'info@acme.it',
      partitaIva: '98765432109',
      codiceFiscale: '98765432109',
      codiceDestinatario: 'ABC1234',
      street: 'Via Dante 10',
      city: 'Roma',
      province: 'RM',
      postalCode: '00100',
      country: 'IT',
    },
  });

  const client2 = await prisma.client.upsert({
    where: { id: '00000000-0000-0000-0000-000000000002' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000002',
      userId: user.id,
      type: 'FREELANCER',
      name: 'Luigi Verdi',
      email: 'luigi@verdi.it',
      partitaIva: '11223344556',
      codiceFiscale: 'VRDLGU90A01F205X',
      street: 'Corso Vittorio Emanuele 5',
      city: 'Torino',
      province: 'TO',
      postalCode: '10100',
      country: 'IT',
    },
  });

  // Create invoices
  const now = new Date();
  const year = now.getFullYear();

  await prisma.invoice.upsert({
    where: { userId_year_sequenceNumber: { userId: user.id, year, sequenceNumber: 1 } },
    update: {},
    create: {
      userId: user.id,
      clientId: client1.id,
      number: `FT-1/${year}`,
      year,
      sequenceNumber: 1,
      status: 'PAID',
      issueDate: new Date(year, 0, 15),
      dueDate: new Date(year, 1, 15),
      ivaRate: 22,
      applyRitenuta: true,
      ritenutaRate: 20,
      subtotal: 500000,
      taxableBase: 500000,
      ivaAmount: 110000,
      grossTotal: 610000,
      ritenutaAmount: 100000,
      netPayable: 510000,
      paymentTerms: 'Bonifico bancario entro 30 giorni',
      items: {
        create: [
          { description: 'Sviluppo applicazione web', quantity: 1, unitPriceCents: 300000, amount: 300000, sortOrder: 0 },
          { description: 'Consulenza tecnica', quantity: 10, unitPriceCents: 20000, amount: 200000, sortOrder: 1 },
        ],
      },
    },
  });

  await prisma.invoice.upsert({
    where: { userId_year_sequenceNumber: { userId: user.id, year, sequenceNumber: 2 } },
    update: {},
    create: {
      userId: user.id,
      clientId: client2.id,
      number: `FT-2/${year}`,
      year,
      sequenceNumber: 2,
      status: 'SENT',
      issueDate: new Date(year, 1, 1),
      dueDate: new Date(year, 2, 1),
      ivaRate: 22,
      subtotal: 150000,
      taxableBase: 150000,
      ivaAmount: 33000,
      grossTotal: 183000,
      netPayable: 183000,
      paymentTerms: 'Bonifico bancario entro 30 giorni',
      items: {
        create: [
          { description: 'Manutenzione sito web - Febbraio', quantity: 1, unitPriceCents: 150000, amount: 150000, sortOrder: 0 },
        ],
      },
    },
  });

  console.log('Seed completed successfully!');
  console.log('Demo user: demo@devdash.dev / password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
