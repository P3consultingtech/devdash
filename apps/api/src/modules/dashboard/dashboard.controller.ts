import { type Request, type Response } from 'express';
import * as dashboardService from './dashboard.service';

function parseYear(raw: unknown): number {
  const current = new Date().getFullYear();
  const n = Number(raw);
  if (!raw || !Number.isFinite(n)) return current;
  return Math.min(Math.max(Math.round(n), 1900), 2100);
}

export async function getSummary(req: Request, res: Response) {
  const year = parseYear(req.query.year);
  const data = await dashboardService.getSummary(req.userId!, year);
  res.json({ success: true, data });
}

export async function getRevenue(req: Request, res: Response) {
  const year = parseYear(req.query.year);
  const data = await dashboardService.getMonthlyRevenue(req.userId!, year);
  res.json({ success: true, data });
}

export async function getInvoicesByStatus(req: Request, res: Response) {
  const year = parseYear(req.query.year);
  const data = await dashboardService.getInvoicesByStatus(req.userId!, year);
  res.json({ success: true, data });
}

export async function getTopClients(req: Request, res: Response) {
  const year = parseYear(req.query.year);
  const data = await dashboardService.getTopClients(req.userId!, year);
  res.json({ success: true, data });
}

export async function getRecentActivity(req: Request, res: Response) {
  const data = await dashboardService.getRecentActivity(req.userId!);
  res.json({ success: true, data });
}
