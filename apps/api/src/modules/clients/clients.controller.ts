import { Request, Response } from 'express';
import * as clientsService from './clients.service';

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
  res.status(201).json({ success: true, data: client });
}

export async function update(req: Request, res: Response) {
  const client = await clientsService.updateClient(req.userId!, req.params.id as string, req.body);
  res.json({ success: true, data: client });
}

export async function remove(req: Request, res: Response) {
  await clientsService.deleteClient(req.userId!, req.params.id as string);
  res.json({ success: true });
}
