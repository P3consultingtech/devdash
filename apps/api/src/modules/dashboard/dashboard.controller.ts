import { Request, Response } from 'express';
import * as dashboardService from './dashboard.service';

export async function getSummary(req: Request, res: Response) {
  const year = req.query.year ? Number(req.query.year) : new Date().getFullYear();
  const data = await dashboardService.getSummary(req.userId!, year);
  res.json({ success: true, data });
}

export async function getRevenue(req: Request, res: Response) {
  const year = req.query.year ? Number(req.query.year) : new Date().getFullYear();
  const data = await dashboardService.getMonthlyRevenue(req.userId!, year);
  res.json({ success: true, data });
}

export async function getInvoicesByStatus(req: Request, res: Response) {
  const year = req.query.year ? Number(req.query.year) : new Date().getFullYear();
  const data = await dashboardService.getInvoicesByStatus(req.userId!, year);
  res.json({ success: true, data });
}

export async function getTopClients(req: Request, res: Response) {
  const year = req.query.year ? Number(req.query.year) : new Date().getFullYear();
  const data = await dashboardService.getTopClients(req.userId!, year);
  res.json({ success: true, data });
}

export async function getRecentActivity(req: Request, res: Response) {
  const data = await dashboardService.getRecentActivity(req.userId!);
  res.json({ success: true, data });
}
