import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { dashboardQuerySchema } from '@devdash/shared';
import * as controller from './dashboard.controller';

const router = Router();

router.use(authenticate);

router.get('/summary', validate(dashboardQuerySchema, 'query'), controller.getSummary);
router.get('/revenue', validate(dashboardQuerySchema, 'query'), controller.getRevenue);
router.get('/invoices-by-status', validate(dashboardQuerySchema, 'query'), controller.getInvoicesByStatus);
router.get('/top-clients', validate(dashboardQuerySchema, 'query'), controller.getTopClients);
router.get('/recent-activity', controller.getRecentActivity);

export default router;
