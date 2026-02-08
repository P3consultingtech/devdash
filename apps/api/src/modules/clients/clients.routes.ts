import { Router } from 'express';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/auth';
import { createClientSchema, clientListQuerySchema } from '@devdash/shared';
import * as controller from './clients.controller';

const router = Router();

router.use(authenticate);

router.get('/', validate(clientListQuerySchema, 'query'), controller.list);
router.get('/:id', controller.getById);
router.post('/', validate(createClientSchema), controller.create);
router.put('/:id', validate(createClientSchema), controller.update);
router.delete('/:id', controller.remove);

export default router;
