import { type Request, type Response } from 'express';
import * as invoicesService from './invoices.service';
import { generateInvoicePdf } from '../pdf/pdf.service';
import { toCsv } from '../../utils/csv';
import { formatCurrency } from '@devdash/shared';

export async function list(req: Request, res: Response) {
  const result = await invoicesService.listInvoices(req.userId!, req.query as any);
  res.json({ success: true, data: result });
}

export async function getById(req: Request, res: Response) {
  const invoice = await invoicesService.getInvoiceById(req.userId!, req.params.id as string);
  res.json({ success: true, data: invoice });
}

export async function create(req: Request, res: Response) {
  const invoice = await invoicesService.createInvoice(req.userId!, req.body);
  res.status(201).json({ success: true, data: invoice });
}

export async function update(req: Request, res: Response) {
  const invoice = await invoicesService.updateInvoice(
    req.userId!,
    req.params.id as string,
    req.body,
  );
  res.json({ success: true, data: invoice });
}

export async function remove(req: Request, res: Response) {
  await invoicesService.deleteInvoice(req.userId!, req.params.id as string);
  res.json({ success: true });
}

export async function updateStatus(req: Request, res: Response) {
  const invoice = await invoicesService.updateInvoiceStatus(
    req.userId!,
    req.params.id as string,
    req.body.status,
  );
  res.json({ success: true, data: invoice });
}

export async function duplicate(req: Request, res: Response) {
  const invoice = await invoicesService.duplicateInvoice(req.userId!, req.params.id as string);
  res.status(201).json({ success: true, data: invoice });
}

export async function getNextNumber(req: Request, res: Response) {
  const nextNumber = await invoicesService.getNextInvoiceNumber(req.userId!);
  res.json({ success: true, data: nextNumber });
}

export async function exportCsv(req: Request, res: Response) {
  const invoices = await invoicesService.exportInvoices(req.userId!);

  const headers = [
    'Numero',
    'Cliente',
    'Stato',
    'Data Emissione',
    'Data Scadenza',
    'Imponibile',
    'IVA',
    'Totale',
    'Netto a Pagare',
  ];
  const rows = invoices.map((inv) => [
    inv.number,
    inv.client.name,
    inv.status,
    new Date(inv.issueDate).toLocaleDateString('it-IT'),
    new Date(inv.dueDate).toLocaleDateString('it-IT'),
    formatCurrency(inv.subtotal, 'it'),
    formatCurrency(inv.ivaAmount, 'it'),
    formatCurrency(inv.grossTotal, 'it'),
    formatCurrency(inv.netPayable, 'it'),
  ]);

  const csv = toCsv(headers, rows);
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="fatture.csv"');
  res.send('\uFEFF' + csv);
}

export async function downloadPdf(req: Request, res: Response) {
  const invoice = await invoicesService.getInvoiceById(req.userId!, req.params.id as string);
  const pdfBuffer = await generateInvoicePdf(req.userId!, invoice);

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="${invoice.number.replace('/', '-')}.pdf"`,
  );
  res.send(pdfBuffer);
}
