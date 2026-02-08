import { Router } from 'express';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/auth';
import { updateBusinessProfileSchema, updateUserSettingsSchema, updateProfileSchema } from '@devdash/shared';
import * as controller from './settings.controller';

const router = Router();

router.use(authenticate);

router.get('/profile', controller.getProfile);
router.put('/profile', validate(updateProfileSchema), controller.updateProfile);
router.get('/business', controller.getBusinessProfile);
router.put('/business', validate(updateBusinessProfileSchema), controller.updateBusinessProfile);
router.get('/preferences', controller.getSettings);
router.put('/preferences', validate(updateUserSettingsSchema), controller.updateSettings);

export default router;
