const express = require('express');
const multer = require('multer');
const path = require('path');
const { Op } = require('sequelize');
const Ticket = require('../models/Ticket');
const VoiceNote = require('../models/VoiceNote');
const OTP = require('../models/OTP');

const router = express.Router();

// Setup Multer for voice notes
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// Create ticket (with optional voice note)
router.post('/', upload.single('voiceNote'), async (req, res) => {
  try {
    const { name, phone, title, description, category, priority, location, lat, lng } = req.body;
    
    const ticket = await Ticket.create({
      name, phone, title, description, category, priority, location,
      lat: lat ? parseFloat(lat) : null,
      lng: lng ? parseFloat(lng) : null
    });

    if (req.file) {
      await VoiceNote.create({
        filePath: `/uploads/${req.file.filename}`,
        TicketId: ticket.id
      });
    }

    res.status(201).json(ticket);
  } catch (err) {
    console.error('CREATE TICKET ERROR:', err);
    res.status(500).json({ error: 'Failed to create ticket', details: err.message });
  }
});

// Get all tickets
router.get('/', async (req, res) => {
  try {
    const tickets = await Ticket.findAll({ include: VoiceNote, order: [['createdAt', 'DESC']] });
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
});

// Generate OTP for Satisfaction Lock
router.post('/:id/generate-otp', async (req, res) => {
  try {
    const ticket = await Ticket.findByPk(req.params.id);
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

    // Generate 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60000); // 10 minutes

    // Delete existing OTP if any
    await OTP.destroy({ where: { TicketId: ticket.id } });
    
    await OTP.create({ code, expiresAt, TicketId: ticket.id });

    // In a real app, this is where we'd use Twilio:
    // await twilioClient.messages.create({ body: `Your OTP is ${code}`, to: ticket.phone, from: '...' });
    
    console.log(`\n\n=== SIMULATED SMS TO ${ticket.phone} ===\nYour Satisfaction Lock OTP for ticket ${ticket.id} is: ${code}\n====================================\n`);

    res.json({ message: 'OTP sent successfully (check console)' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate OTP' });
  }
});

// Resolve Ticket with OTP
router.put('/:id/resolve', async (req, res) => {
  try {
    const { otp, adminNotes } = req.body;
    const ticket = await Ticket.findByPk(req.params.id);
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

    const validOtp = await OTP.findOne({ 
      where: { 
        TicketId: ticket.id, 
        code: otp,
        expiresAt: { [Op.gt]: new Date() } // Must not be expired
      } 
    });

    if (!validOtp) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    ticket.status = 'resolved';
    ticket.adminNotes = adminNotes;
    await ticket.save();

    // OTP consumed
    await validOtp.destroy();

    res.json({ message: 'Ticket resolved successfully', ticket });
  } catch (err) {
    res.status(500).json({ error: 'Failed to resolve ticket' });
  }
});

module.exports = router;
