import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/auth';
import { updateBusinessProfileSchema, updateUserSettingsSchema, updateProfileSchema } from '@devdash/shared';
import * as controller from './settings.controller';

const upload = multer({
  storage: multer.diskStorage({
    destination: path.resolve(__dirname, '../../../uploads/logos'),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, `${Date.now()}${ext}`);
    },
  }),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['.png', '.jpg', '.jpeg', '.svg', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, allowed.includes(ext));
  },
});

const router = Router();

router.use(authenticate);

router.get('/profile', controller.getProfile);
router.put('/profile', validate(updateProfileSchema), controller.updateProfile);
router.get('/business', controller.getBusinessProfile);
router.put('/business', validate(updateBusinessProfileSchema), controller.updateBusinessProfile);
router.post('/logo', upload.single('logo'), controller.uploadLogo);
router.delete('/logo', controller.deleteLogo);
router.get('/preferences', controller.getSettings);
router.put('/preferences', validate(updateUserSettingsSchema), controller.updateSettings);

export default router;
