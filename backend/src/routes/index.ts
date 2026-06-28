import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { subtitleController } from '../controllers/subtitleController';

const router = Router();

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['.mp4', '.mov', '.avi', '.mkv', '.webm'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  },
});

router.post('/upload', upload.single('video'), subtitleController.uploadVideo);
router.get('/transcribe/:projectId/progress', subtitleController.transcribeProgress);
router.post('/transcribe/:projectId', subtitleController.transcribe);
router.get('/project/:projectId', subtitleController.getProject);
router.put('/project/:projectId/subtitles', subtitleController.updateSubtitles);
router.put('/project/:projectId/style', subtitleController.updateStyle);
router.get('/export/:projectId/:format', subtitleController.exportSubtitles);
router.post('/burn/:projectId', subtitleController.burnIn);
router.get('/presets', subtitleController.getPresets);
router.get('/video/:projectId', subtitleController.streamVideo);

export default router;
