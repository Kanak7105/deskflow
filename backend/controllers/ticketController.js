import Ticket from '../models/Ticket.js';

const PRIORITY_TARGETS = {
  urgent: 60,
  high: 240,
  medium: 1440,
  low: 4320
};

const STATUS_ORDER = ['open', 'in_progress', 'resolved', 'closed'];

export const addDerivedFields = (ticket) => {
  const doc = ticket.toObject ? ticket.toObject() : ticket;
  const now = new Date();
  const end = (doc.status === 'resolved' || doc.status === 'closed') && doc.resolvedAt ? new Date(doc.resolvedAt) : now;
  
  const ageMinutes = Math.floor((end - new Date(doc.createdAt)) / 60000);
  const targetMinutes = PRIORITY_TARGETS[doc.priority] || 1440;
  const slaBreached = ageMinutes > targetMinutes;

  return {
    ...doc,
    ageMinutes,
    slaBreached
  };
};

export const createTicket = async (req, res) => {
  try {
    const { subject, description, customerEmail, priority } = req.body;
    const ticket = new Ticket({ subject, description, customerEmail, priority });
    await ticket.save();
    res.status(201).json(addDerivedFields(ticket));
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getTickets = async (req, res) => {
  try {
    const { status, priority, breached } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    
    let tickets = await Ticket.find(filter).sort({ createdAt: -1 });
    let enriched = tickets.map(addDerivedFields);

    if (breached === 'true') {
      enriched = enriched.filter(t => t.slaBreached);
    }

    res.status(200).json(enriched);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ error: 'Status is required to update' });
    }

    const ticket = await Ticket.findById(id);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    const currentIdx = STATUS_ORDER.indexOf(ticket.status);
    const nextIdx = STATUS_ORDER.indexOf(status);

    if (nextIdx === -1) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    // Rules: forward 1 step allowed? Actually, open -> in_progress -> resolved -> closed
    // Skipping forward is not allowed. 
    // Wait, requirement: "Skipping forward (e.g. open -> resolved) is not allowed."
    // This implies nextIdx cannot be > currentIdx + 1.
    // "Moving backwards is allowed only one step (e.g. resolved -> in_progress)"
    // This implies nextIdx cannot be < currentIdx - 1.
    if (nextIdx > currentIdx + 1) {
      return res.status(400).json({ error: `Cannot skip forward from ${ticket.status} to ${status}` });
    }
    
    if (nextIdx < currentIdx - 1) {
      return res.status(400).json({ error: `Cannot move backward more than one step from ${ticket.status} to ${status}` });
    }

    // Update status
    ticket.status = status;

    // Handle resolvedAt
    if (status === 'resolved' && currentIdx < STATUS_ORDER.indexOf('resolved')) {
      ticket.resolvedAt = new Date();
    } else if (currentIdx === STATUS_ORDER.indexOf('resolved') && nextIdx < currentIdx) {
      // moving back from resolved to in_progress
      ticket.resolvedAt = null;
    }

    await ticket.save();
    res.status(200).json(addDerivedFields(ticket));
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const ticket = await Ticket.findByIdAndDelete(id);
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
    res.status(200).json({ message: 'Ticket deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getStats = async (req, res) => {
  try {
    const tickets = await Ticket.find();
    const stats = {
      status: { open: 0, in_progress: 0, resolved: 0, closed: 0 },
      priority: { low: 0, medium: 0, high: 0, urgent: 0 },
      breachedOpen: 0
    };

    tickets.forEach(ticket => {
      const t = addDerivedFields(ticket);
      stats.status[t.status] = (stats.status[t.status] || 0) + 1;
      stats.priority[t.priority] = (stats.priority[t.priority] || 0) + 1;
      
      if (t.slaBreached && t.status !== 'resolved' && t.status !== 'closed') {
        stats.breachedOpen++;
      }
    });

    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
