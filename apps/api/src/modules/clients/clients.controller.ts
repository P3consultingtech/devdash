import { type Request, type Response } from 'express';
import * as clientsService from './clients.service';
import { toCsv } from '../../utils/csv';
import { audit } from '../../utils/audit';

export async function list(req: Request, res: Response) {
  const result = await clientsService.listClients(req.userId!, req.query as any);
  res.json({ success: true, data: result });
}

export async function getById(req: Request, res: Response) {
  const client = await clientsService.getClientById(req.userId!, req.params.id as string);
  res.json({ success: true, data: client });
}

export async function create(req: Request, res: Response) {
  const client = await clientsService.createClient(req.userId!, req.body);
  audit({
    userId: req.userId!,
    action: 'CREATE',
    entity: 'Client',
    entityId: client.id,
    ipAddress: req.ip,
  });
  res.status(201).json({ success: true, data: client });
}

export async function update(req: Request, res: Response) {
  const client = await clientsService.updateClient(req.userId!, req.params.id as string, req.body);
  audit({
    userId: req.userId!,
    action: 'UPDATE',
    entity: 'Client',
    entityId: client.id,
    ipAddress: req.ip,
  });
  res.json({ success: true, data: client });
}

export async function remove(req: Request, res: Response) {
  await clientsService.deleteClient(req.userId!, req.params.id as string);
  audit({
    userId: req.userId!,
    action: 'DELETE',
    entity: 'Client',
    entityId: req.params.id as string,
    ipAddress: req.ip,
  });
  res.json({ success: true });
}

export async function exportCsv(req: Request, res: Response) {
  const clients = await clientsService.exportClients(req.userId!);

  const headers = [
    'Nome',
    'Tipo',
    'Email',
    'Telefono',
    'P.IVA',
    'C.F.',
    'PEC',
    'Cod. Destinatario',
    'Indirizzo',
    'Città',
    'Prov.',
    'CAP',
    'Paese',
  ];
  const rows = clients.map((c) => [
    c.name,
    c.type,
    c.email || '',
    c.phone || '',
    c.partitaIva || '',
    c.codiceFiscale || '',
    c.pec || '',
    c.codiceDestinatario || '',
    c.street || '',
    c.city || '',
    c.province || '',
    c.postalCode || '',
    c.country || '',
  ]);

  const csv = toCsv(headers, rows);
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="clienti.csv"');
  res.send('\uFEFF' + csv); // BOM for Excel UTF-8 compatibility
}
