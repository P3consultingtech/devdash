import { Request, Response } from 'express';
import * as settingsService from './settings.service';

export async function uploadLogo(req: Request, res: Response) {
  if (!req.file) {
    res.status(400).json({ success: false, error: { code: 'NO_FILE', message: 'No file uploaded' } });
    return;
  }
  const logoUrl = `/uploads/logos/${req.file.filename}`;
  const bp = await settingsService.updateLogoUrl(req.userId!, logoUrl);
  res.json({ success: true, data: bp });
}

export async function deleteLogo(req: Request, res: Response) {
  const bp = await settingsService.updateLogoUrl(req.userId!, null);
  res.json({ success: true, data: bp });
}

export async function getProfile(req: Request, res: Response) {
  const profile = await settingsService.getProfile(req.userId!);
  res.json({ success: true, data: profile });
}

export async function updateProfile(req: Request, res: Response) {
  const profile = await settingsService.updateProfile(req.userId!, req.body);
  res.json({ success: true, data: profile });
}

export async function getBusinessProfile(req: Request, res: Response) {
  const bp = await settingsService.getBusinessProfile(req.userId!);
  res.json({ success: true, data: bp });
}

export async function updateBusinessProfile(req: Request, res: Response) {
  const bp = await settingsService.updateBusinessProfile(req.userId!, req.body);
  res.json({ success: true, data: bp });
}

export async function getSettings(req: Request, res: Response) {
  const settings = await settingsService.getSettings(req.userId!);
  res.json({ success: true, data: settings });
}

export async function updateSettings(req: Request, res: Response) {
  const settings = await settingsService.updateSettings(req.userId!, req.body);
  res.json({ success: true, data: settings });
}
