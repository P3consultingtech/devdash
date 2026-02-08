import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/auth';
import {
  updateBusinessProfileSchema,
  updateUserSettingsSchema,
  updateProfileSchema,
} from '@devdash/shared';
import * as controller from './settings.controller';

const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp'] as const;

const MIME_TO_EXT: Record<string, string> = {
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/svg+xml': '.svg',
  'image/webp': '.webp',
};

const upload = multer({
  storage: multer.diskStorage({
    destination: path.resolve(__dirname, '../../../uploads/logos'),
    filename: (_req, file, cb) => {
      const ext = MIME_TO_EXT[file.mimetype] || path.extname(file.originalname).toLowerCase();
      cb(null, `${crypto.randomUUID()}${ext}`);
    },
  }),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype as any)) {
      return cb(new Error('Only PNG, JPEG, SVG, and WebP images are allowed'));
    }
    cb(null, true);
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
