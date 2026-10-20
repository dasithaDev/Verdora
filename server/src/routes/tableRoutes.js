import express from 'express';
import { getTables, checkAvailability } from '../controllers/tableController.js';
import { validatePagination } from '../middleware/validate.js';

const router = express.Router();

router.get('/', validatePagination, getTables);
router.get('/availability', checkAvailability);

export default router;
