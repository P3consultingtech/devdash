import { Router } from 'express';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/auth';
import { createInvoiceSchema, invoiceListQuerySchema, invoiceStatusTransitionSchema } from '@devdash/shared';
import * as controller from './invoices.controller';

const router = Router();

router.use(authenticate);

router.get('/next-number', controller.getNextNumber);
router.get('/', validate(invoiceListQuerySchema, 'query'), controller.list);
router.get('/:id', controller.getById);
router.post('/', validate(createInvoiceSchema), controller.create);
router.put('/:id', validate(createInvoiceSchema), controller.update);
router.delete('/:id', controller.remove);
router.patch('/:id/status', validate(invoiceStatusTransitionSchema), controller.updateStatus);
router.post('/:id/duplicate', controller.duplicate);
router.get('/:id/pdf', controller.downloadPdf);

export default router;
