import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';
import { prisma } from '../../config/database';
import { formatCurrency } from '../../utils/italian-tax';

export async function generateInvoicePdf(userId: string, invoice: any): Promise<Buffer> {
  const businessProfile = await prisma.businessProfile.findUnique({
    where: { userId },
  });

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const pageWidth = doc.page.width - 100; // margins

    // --- HEADER ---
    let headerLeft = 50;
    if (businessProfile?.logoUrl) {
      const logoPath = path.resolve(__dirname, '../../../', businessProfile.logoUrl.replace(/^\//, ''));
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, 50, 40, { width: 60, height: 60 });
        headerLeft = 120;
      }
    }
    doc.fontSize(20).font('Helvetica-Bold').text('FATTURA', headerLeft, 50);
    doc.fontSize(10).font('Helvetica').text(invoice.number, headerLeft, 75);

    // Business info (right side)
    const rightCol = 350;
    let y = 50;

    if (businessProfile) {
      doc.fontSize(11).font('Helvetica-Bold').text(businessProfile.businessName, rightCol, y, { width: 200, align: 'right' });
      y += 16;
      doc.fontSize(9).font('Helvetica');
      if (businessProfile.street) { doc.text(businessProfile.street, rightCol, y, { width: 200, align: 'right' }); y += 12; }
      if (businessProfile.city) {
        const addr = [businessProfile.postalCode, businessProfile.city, businessProfile.province].filter(Boolean).join(' ');
        doc.text(addr, rightCol, y, { width: 200, align: 'right' }); y += 12;
      }
      if (businessProfile.partitaIva) { doc.text(`P.IVA: ${businessProfile.partitaIva}`, rightCol, y, { width: 200, align: 'right' }); y += 12; }
      if (businessProfile.codiceFiscale) { doc.text(`C.F.: ${businessProfile.codiceFiscale}`, rightCol, y, { width: 200, align: 'right' }); y += 12; }
      if (businessProfile.pec) { doc.text(`PEC: ${businessProfile.pec}`, rightCol, y, { width: 200, align: 'right' }); y += 12; }
    }

    // --- INVOICE DETAILS ---
    y = 140;
    doc.moveTo(50, y).lineTo(50 + pageWidth, y).stroke();
    y += 10;

    doc.fontSize(9).font('Helvetica');
    const issueDate = new Date(invoice.issueDate).toLocaleDateString('it-IT');
    const dueDate = new Date(invoice.dueDate).toLocaleDateString('it-IT');
    doc.text(`Data emissione: ${issueDate}`, 50, y);
    doc.text(`Data scadenza: ${dueDate}`, 300, y);
    y += 20;

    // --- CLIENT ---
    doc.fontSize(10).font('Helvetica-Bold').text('Destinatario:', 50, y);
    y += 14;
    doc.fontSize(10).font('Helvetica').text(invoice.client.name, 50, y);
    y += 14;

    if (invoice.client.street) { doc.fontSize(9).text(invoice.client.street, 50, y); y += 12; }
    if (invoice.client.city) {
      const addr = [invoice.client.postalCode, invoice.client.city, invoice.client.province].filter(Boolean).join(' ');
      doc.text(addr, 50, y); y += 12;
    }
    if (invoice.client.partitaIva) { doc.text(`P.IVA: ${invoice.client.partitaIva}`, 50, y); y += 12; }
    if (invoice.client.codiceFiscale) { doc.text(`C.F.: ${invoice.client.codiceFiscale}`, 50, y); y += 12; }
    if (invoice.client.codiceDestinatario) { doc.text(`Cod. Dest.: ${invoice.client.codiceDestinatario}`, 50, y); y += 12; }
    if (invoice.client.pec) { doc.text(`PEC: ${invoice.client.pec}`, 50, y); y += 12; }

    y += 10;

    // --- TABLE HEADER ---
    doc.moveTo(50, y).lineTo(50 + pageWidth, y).stroke();
    y += 8;

    const cols = { desc: 50, qty: 320, price: 390, amount: 460 };
    doc.fontSize(9).font('Helvetica-Bold');
    doc.text('Descrizione', cols.desc, y);
    doc.text('Qtà', cols.qty, y, { width: 60, align: 'right' });
    doc.text('Prezzo', cols.price, y, { width: 60, align: 'right' });
    doc.text('Importo', cols.amount, y, { width: 80, align: 'right' });
    y += 14;

    doc.moveTo(50, y).lineTo(50 + pageWidth, y).stroke();
    y += 6;

    // --- TABLE ROWS ---
    doc.fontSize(9).font('Helvetica');
    for (const item of invoice.items) {
      if (y > 700) {
        doc.addPage();
        y = 50;
      }
      doc.text(item.description, cols.desc, y, { width: 260 });
      doc.text(item.quantity.toString(), cols.qty, y, { width: 60, align: 'right' });
      doc.text(formatCurrency(item.unitPriceCents, 'it'), cols.price, y, { width: 60, align: 'right' });
      doc.text(formatCurrency(item.amount, 'it'), cols.amount, y, { width: 80, align: 'right' });
      y += 16;
    }

    y += 6;
    doc.moveTo(50, y).lineTo(50 + pageWidth, y).stroke();
    y += 12;

    // --- TOTALS ---
    const totalsX = 350;
    const totalsValX = 460;
    const totalsW = 80;

    doc.fontSize(9).font('Helvetica');
    doc.text('Imponibile:', totalsX, y, { width: 100, align: 'right' });
    doc.text(formatCurrency(invoice.subtotal, 'it'), totalsValX, y, { width: totalsW, align: 'right' });
    y += 14;

    if (invoice.applyCassa && invoice.cassaAmount > 0) {
      doc.text(`Cassa prev. (${invoice.cassaRate}%):`, totalsX, y, { width: 100, align: 'right' });
      doc.text(formatCurrency(invoice.cassaAmount, 'it'), totalsValX, y, { width: totalsW, align: 'right' });
      y += 14;
    }

    if (invoice.ivaRate > 0) {
      doc.text(`IVA (${invoice.ivaRate}%):`, totalsX, y, { width: 100, align: 'right' });
      doc.text(formatCurrency(invoice.ivaAmount, 'it'), totalsValX, y, { width: totalsW, align: 'right' });
      y += 14;
    }

    if (invoice.applyBollo && invoice.bolloAmount > 0) {
      doc.text('Bollo virtuale:', totalsX, y, { width: 100, align: 'right' });
      doc.text(formatCurrency(invoice.bolloAmount, 'it'), totalsValX, y, { width: totalsW, align: 'right' });
      y += 14;
    }

    doc.font('Helvetica-Bold');
    doc.text('Totale:', totalsX, y, { width: 100, align: 'right' });
    doc.text(formatCurrency(invoice.grossTotal, 'it'), totalsValX, y, { width: totalsW, align: 'right' });
    y += 14;

    if (invoice.applyRitenuta && invoice.ritenutaAmount > 0) {
      doc.font('Helvetica');
      doc.text(`Ritenuta d'acconto (${invoice.ritenutaRate}%):`, totalsX - 30, y, { width: 130, align: 'right' });
      doc.text(`-${formatCurrency(invoice.ritenutaAmount, 'it')}`, totalsValX, y, { width: totalsW, align: 'right' });
      y += 14;

      doc.font('Helvetica-Bold').fontSize(11);
      doc.text('Netto a pagare:', totalsX, y, { width: 100, align: 'right' });
      doc.text(formatCurrency(invoice.netPayable, 'it'), totalsValX, y, { width: totalsW, align: 'right' });
      y += 20;
    }

    // --- NOTES ---
    if (invoice.notes) {
      y += 10;
      doc.fontSize(9).font('Helvetica-Bold').text('Note:', 50, y);
      y += 12;
      doc.font('Helvetica').text(invoice.notes, 50, y, { width: pageWidth });
      y += doc.heightOfString(invoice.notes, { width: pageWidth }) + 10;
    }

    // --- PAYMENT INFO ---
    if (invoice.paymentTerms || businessProfile?.iban) {
      y += 10;
      doc.fontSize(9).font('Helvetica-Bold').text('Modalità di pagamento:', 50, y);
      y += 12;
      doc.font('Helvetica');
      if (invoice.paymentTerms) { doc.text(invoice.paymentTerms, 50, y); y += 12; }
      if (businessProfile?.iban) { doc.text(`IBAN: ${businessProfile.iban}`, 50, y); y += 12; }
    }

    doc.end();
  });
}
