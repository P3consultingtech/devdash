import { Request, Response } from 'express';
import * as authService from './auth.service';

export async function register(req: Request, res: Response) {
  const result = await authService.register(req.body);
  res.status(201).json({ success: true, data: result });
}

export async function login(req: Request, res: Response) {
  const result = await authService.login(req.body);
  res.json({ success: true, data: result });
}

export async function refresh(req: Request, res: Response) {
  const result = await authService.refreshTokens(req.body.refreshToken);
  res.json({ success: true, data: result });
}

export async function logout(req: Request, res: Response) {
  await authService.logout(req.userId!);
  res.json({ success: true });
}

export async function getMe(req: Request, res: Response) {
  const user = await authService.getMe(req.userId!);
  res.json({ success: true, data: user });
}
