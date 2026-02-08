import { type Request, type Response } from 'express';
import * as authService from './auth.service';
import { audit } from '../../utils/audit';

export async function register(req: Request, res: Response) {
  const result = await authService.register(req.body);
  audit({
    userId: result.user.id,
    action: 'CREATE',
    entity: 'User',
    entityId: result.user.id,
    ipAddress: req.ip,
  });
  res.status(201).json({ success: true, data: result });
}

export async function login(req: Request, res: Response) {
  try {
    const result = await authService.login(req.body);
    audit({
      userId: result.user.id,
      action: 'LOGIN',
      entity: 'User',
      entityId: result.user.id,
      ipAddress: req.ip,
    });
    res.json({ success: true, data: result });
  } catch (err) {
    audit({
      action: 'LOGIN_FAILED',
      entity: 'User',
      details: { email: req.body.email },
      ipAddress: req.ip,
    });
    throw err;
  }
}

export async function refresh(req: Request, res: Response) {
  const result = await authService.refreshTokens(req.body.refreshToken);
  res.json({ success: true, data: result });
}

export async function logout(req: Request, res: Response) {
  await authService.logout(req.userId!);
  audit({
    userId: req.userId!,
    action: 'LOGOUT',
    entity: 'User',
    entityId: req.userId!,
    ipAddress: req.ip,
  });
  res.json({ success: true });
}

export async function getMe(req: Request, res: Response) {
  const user = await authService.getMe(req.userId!);
  res.json({ success: true, data: user });
}
