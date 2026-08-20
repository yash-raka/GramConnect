require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const path = require('path');
const db = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // For voice notes

// Basic route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'GramConnect API is running' });
});

// Import routes
const ticketRoutes = require('./routes/tickets');
app.use('/api/tickets', ticketRoutes);

// Automatic Escalation Cron Job (runs every day at midnight)
cron.schedule('0 0 * * *', async () => {
  console.log('Running auto-escalation check...');
  try {
    const { Op } = require('sequelize');
    const Ticket = require('./models/Ticket');
    
    // 7 days ago
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [updatedCount] = await Ticket.update(
      { escalation_level: 'STATE_AUTHORITY' },
      { 
        where: { 
          status: { [Op.ne]: 'resolved' },
          escalation_level: { [Op.ne]: 'STATE_AUTHORITY' },
          createdAt: { [Op.lt]: sevenDaysAgo }
        } 
      }
    );
    console.log(`Auto-escalation complete. Escalated ${updatedCount} tickets.`);
  } catch (error) {
    console.error('Error in auto-escalation cron:', error);
  }
});

// Sync database and start server
db.sync({ alter: true }).then(() => {
  console.log('Database synced successfully');
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Failed to sync database:', err);
});
