import express from 'express';
import { getTables, checkAvailability } from '../controllers/tableController.js';

const router = express.Router();

router.get('/', getTables);
router.get('/availability', checkAvailability);

export default router;
