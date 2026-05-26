import express from 'express';
import {
  createTicket,
  getTickets,
  updateTicket,
  deleteTicket,
  getStats
} from '../controllers/ticketController.js';

const router = express.Router();

router.get('/stats', getStats);
router.post('/', createTicket);
router.get('/', getTickets);
router.patch('/:id', updateTicket);
router.delete('/:id', deleteTicket);

export default router;
