const express = require('express');
const dotenv = require('dotenv');
const dnsRoutes = require('./routes/dnsRoutes');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use('/api', dnsRoutes); // Use the /api prefix for all routes

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
